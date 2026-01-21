import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Helper to normalize product data
const normalizeProduct = (doc) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Fallback for missing images
        imageUrl: data.imageUrl || "/assets/default.jpg",
        // Ensure arrays exist
        flavorTags: data.flavorTags || [],
        sizes: data.sizes || null,
        price: data.price ?? null
    };
};

/**
 * Fetch products, optionally filtered by category
 * @param {Object} filters
 * @param {string} filters.category - 'tortas', 'vasos', 'alfajores'
 */
export const getProducts = async ({ category } = {}) => {
    try {
        const productsRef = collection(db, "products");
        let q = productsRef;

        if (category) {
            q = query(productsRef, where("category", "==", category));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeProduct);
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

/**
 * Fetch featured products
 * @param {number} limitCount 
 */
export const getFeaturedProducts = async (limitCount = 3) => {
    try {
        const productsRef = collection(db, "products");
        const q = query(
            productsRef,
            where("isFeatured", "==", true),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeProduct);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        throw error;
    }
};
