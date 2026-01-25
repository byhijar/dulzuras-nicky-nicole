import { collection, query, where, getDocs, orderBy, Timestamp, runTransaction, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const COLLECTION_NAME = "pedidos";

/**
 * Save a new order to Firestore with Transactional Stock Management
 * @param {Object} orderData 
 */
export const createOrder = async (orderData) => {
    try {
        // Use a transaction to ensure stock is available and decremented atomically
        const orderId = await runTransaction(db, async (transaction) => {
            // 1. Validate stock for all items (if items exist)
            if (orderData.items && Array.isArray(orderData.items)) {
                for (const item of orderData.items) {
                    if (!item.id) continue; // Skip if no ID

                    const productRef = doc(db, "products", item.id);
                    const productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) {
                        throw new Error(`El producto "${item.name}" ya no existe.`);
                    }

                    const productData = productDoc.data();
                    const currentStock = productData.stock !== undefined ? productData.stock : 0;

                    if (currentStock < item.quantity) {
                        throw new Error(`Stock insuficiente para "${item.name}". Disponible: ${currentStock}`);
                    }

                    // 2. Decrement stock (Disabled for Client-side security)
                    // Regular users cannot write to 'products'. 
                    // To enable this, we need Cloud Functions or advanced Rules.
                    // transaction.update(productRef, {
                    //     stock: currentStock - item.quantity
                    // });
                }
            }

            // 3. Create the order
            const newOrderRef = doc(collection(db, COLLECTION_NAME));
            // Ensure we are not saving undefined values if they don't exist in orderData
            const finalOrder = {
                ...orderData,
                createdAt: Timestamp.now(),
                status: "pendiente" // Initial status
            };

            transaction.set(newOrderRef, finalOrder);

            return newOrderRef.id;
        });

        return orderId;
    } catch (error) {
        console.error("Error creating order (Transaction):", error);
        throw error;
    }
};

/**
 * Get orders for a specific user
 * @param {string} userId 
 */
export const getUserOrders = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
};

/**
 * Real-time subscription to user orders
 * @param {string} userId 
 * @param {Function} callback 
 */
export const subscribeToUserOrders = (userId, callback) => {
    // Simplify query to avoid "Missing Index" error
    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort client-side
        orders.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        callback(orders);
    }, (error) => {
        console.error("Error subscribing to orders:", error);
    });
};
