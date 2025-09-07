// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./nippori.db');

db.serialize(() => {
    console.log('Menjalankan skema database...');

    // Tabel untuk Master Produk
    db.run(`
        CREATE TABLE IF NOT EXISTS product_masters (
            title TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Gagal membuat tabel product_masters:", err.message);
        } else {
            console.log("Tabel 'product_masters' siap.");
        }
    });

    // Tabel untuk Varian Produk
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            uuid REAL PRIMARY KEY,
            data TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Gagal membuat tabel products:", err.message);
        } else {
            console.log("Tabel 'products' siap.");
        }
    });
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Inisialisasi database selesai, koneksi ditutup.');
});