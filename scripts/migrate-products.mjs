
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment
dotenv.config();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// --- Validation ---
if (!SERVICE_ACCOUNT_PATH) {
    console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS is not set in .env');
    process.exit(1);
}

const absoluteServiceAccountPath = path.resolve(process.cwd(), SERVICE_ACCOUNT_PATH);

if (!fs.existsSync(absoluteServiceAccountPath)) {
    console.error(`❌ Error: Service Account file not found at: ${absoluteServiceAccountPath}`);
    console.error('👉 Please generate a Service Account Key in Firebase Console -> Project Settings -> Service Accounts');
    console.error('👉 Save it as "secrets/firebase-admin.json" (or matches your .env path)');
    process.exit(1);
}

// --- Initialize Firebase Admin ---
try {
    const serviceAccount = JSON.parse(fs.readFileSync(absoluteServiceAccountPath, 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
}

const db = admin.firestore();

// --- Import Data (ESM import) ---
let tortasPersonalizadas, tortasVaso, alfajoresYGalletas;

try {
    const productosModule = await import('../src/data/productos.js');
    tortasPersonalizadas = productosModule.tortasPersonalizadas;
    tortasVaso = productosModule.tortasVaso;
    alfajoresYGalletas = productosModule.alfajoresYGalletas;
    console.log('✅ Loaded products data from src/data/productos.js');
} catch (error) {
    console.error('❌ Error importing products data:', error.message);
    process.exit(1);
}

// --- Helpers ---
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');        // Trim hyphens
}

function generateFlavorTags(product) {
    const text = `${product.nombre} ${product.relleno || ''} ${product.ingredientes || ''} ${product.bizcocho || ''}`.toLowerCase();
    const possibleTags = ['chocolate', 'frambuesa', 'manjar', 'nuez', 'durazno', 'lucuma', 'canela', 'vainilla', 'frutilla'];
    return possibleTags.filter(tag => text.includes(tag));
}

// --- Migration Logic ---
let totalMigrated = 0;

async function migrateCategory(items, category) {
    console.log(`\n📦 Migrating ${category} (${items.length} items)...`);
    let count = 0;

    for (const item of items) {
        // Slug generation: category + name
        const slug = generateSlug(`${category}-${item.nombre}`);

        // Strict Image Path: /assets/<category>/<filename>
        // Note: We use the plural category name directly as the folder name.
        // If the image filename isn't provided, empty string.
        const imageUrl = item.imagen ? `/assets/${category}/${item.imagen}` : '';

        // Map to new Schema
        const docData = {
            name: item.nombre,
            category: category, // 'tortas', 'vasos', 'alfajores' (PLURAL, STRICT)
            description: item.descripcion || '',
            price: item.precio || null,
            sizes: item.tamaños || null,
            flavorTags: generateFlavorTags(item),
            imageUrl: imageUrl,
            isFeatured: false,
            isAvailable: true,
            // Optional fields
            ...(item.bizcocho && { cakeType: item.bizcocho }),
            ...(item.relleno && { filling: item.relleno }),
            ...(item.remojo && { moistening: item.remojo }),
            ...(item.ingredientes && { ingredients: item.ingredientes }),
        };

        try {
            await db.collection('products').doc(slug).set(docData, { merge: true });
            process.stdout.write('.');
            count++;
            totalMigrated++;
        } catch (error) {
            console.error(`\n❌ Error migrating ${item.nombre}:`, error.message);
        }
    }
    console.log(`\n✅ Finished ${category}: ${count} processed.`);
}

// --- Main Execution ---
async function main() {
    console.log('🚀 Starting Migration to Firestore...');

    // Explicit Categories (Plural)
    await migrateCategory(tortasPersonalizadas, 'tortas');
    await migrateCategory(tortasVaso, 'vasos');
    await migrateCategory(alfajoresYGalletas, 'alfajores');

    console.log('\n✨ Migration Complete!');
    console.log(`📊 Total Documents Migrated/Updated: ${totalMigrated}`);

    // Verify a few items
    const snapshot = await db.collection('products').limit(3).get();
    console.log('\n🔍 Sample Data (First 3 items):');
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- [ID: ${doc.id}]`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Category: ${data.category}`);
        console.log(`  Image: ${data.imageUrl}`);
        console.log('---');
    });
}

main().catch(console.error);
