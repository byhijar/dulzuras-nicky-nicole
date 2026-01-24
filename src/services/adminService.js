import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const COLLECTION_NAME = "products";
const ORDERS_COLLECTION = "pedidos";

/**
 * Create a new product
 * @param {Object} productData 
 */
export const createProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

/**
 * Update an existing product
 * @param {string} id 
 * @param {Object} productData 
 */
export const updateProduct = async (id, productData) => {
    try {
        const productRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(productRef, {
            ...productData,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

/**
 * Delete a product
 * @param {string} id 
 */
export const deleteProduct = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

/**
 * Get all orders for admin
 */
export const getAdminOrders = async () => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        throw error;
    }
};

/**
 * Update order status
 * @param {string} orderId 
 * @param {string} newStatus 
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};
