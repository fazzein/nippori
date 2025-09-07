// migrate.js
const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();

// Inisialisasi Firebase Admin SDK
// Unduh file kunci privat Anda dari Firebase Console:
// Project Settings > Service accounts > Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const db = new sqlite3.Database('./nippori.db');

async function migrate() {
    console.log('Memulai migrasi...');

    // Migrasi product_masters
    db.all("SELECT * FROM product_masters", [], async (err, rows) => {
        if (err) throw err;
        const batch = firestore.batch();
        rows.forEach(row => {
            const docRef = firestore.collection('product_masters').doc(row.title);
            batch.set(docRef, JSON.parse(row.data));
        });
        await batch.commit();
        console.log(`${rows.length} master produk berhasil dimigrasi.`);
    });

    // Migrasi products
    db.all("SELECT * FROM products", [], async (err, rows) => {
        if (err) throw err;
        const batch = firestore.batch();
        rows.forEach(row => {
            const data = JSON.parse(row.data);
            // Firestore lebih baik menggunakan string untuk ID
            const docRef = firestore.collection('products').doc(String(data.uuid));
            batch.set(docRef, data);
        });
        await batch.commit();
        console.log(`${rows.length} varian produk berhasil dimigrasi.`);
    });
}

migrate().catch(console.error);