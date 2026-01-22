import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

// Validate Credentials
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS not found in .env');
    process.exit(1);
}

// Initialize Firebase Admin
try {
    const serviceAccount = JSON.parse(
        readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin Initialized');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
}

const db = admin.firestore();

async function setRandomFeatured() {
    try {
        console.log('🚀 Fetching products...');
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();

        if (snapshot.empty) {
            console.log('⚠️ No products found in database.');
            return;
        }

        const docs = snapshot.docs;
        // Shuffle and pick 3
        const shuffled = docs.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        console.log(`✨ Selected ${selected.length} products to feature:`);

        const batch = db.batch();

        // Optional: Reset all others to false first if you want strict "only 3"
        // But for now, we just ensure these 3 are true.

        selected.forEach(doc => {
            const product = doc.data();
            console.log(`   - [${doc.id}] ${product.name}`);
            batch.update(doc.ref, { isFeatured: true });
        });

        await batch.commit();
        console.log('✅ Success! Home page should now show these products.');

    } catch (error) {
        console.error('❌ Error executing script:', error);
    }
}

setRandomFeatured();
