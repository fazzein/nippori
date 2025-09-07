// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Middleware untuk parse JSON body & serve file statis
app.use(express.json({ limit: '50mb' })); // Menaikkan limit untuk data gambar base64
app.use(express.static('public'));

// Koneksi ke database
const db = new sqlite3.Database('./nippori.db', (err) => {
    if (err) {
        console.error("Gagal konek ke database:", err.message);
    }
    console.log('Terkoneksi ke database SQLite.');
});

// === API ROUTES ===

// Endpoint untuk mendapatkan semua data sekaligus
app.get('/api/data', (req, res) => {
    const data = {
        products: [],
        productMasters: {}
    };

    const getMasters = new Promise((resolve, reject) => {
        db.all("SELECT * FROM product_masters", [], (err, rows) => {
            if (err) return reject(err);
            rows.forEach(row => {
                data.productMasters[row.title] = JSON.parse(row.data);
            });
            resolve();
        });
    });

    const getProducts = new Promise((resolve, reject) => {
        db.all("SELECT * FROM products", [], (err, rows) => {
            if (err) return reject(err);
            rows.forEach(row => {
                data.products.push(JSON.parse(row.data));
            });
            resolve();
        });
    });

    Promise.all([getMasters, getProducts])
        .then(() => res.json(data))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Endpoint untuk menyimpan semua data (dipakai saat import)
app.post('/api/data', (req, res) => {
    const { products, productMasters } = req.body;

    db.serialize(() => {
        // Hapus data lama
        db.run("DELETE FROM products");
        db.run("DELETE FROM product_masters");

        // Insert data baru
        const productStmt = db.prepare("INSERT OR REPLACE INTO products (uuid, data) VALUES (?, ?)");
        products.forEach(p => {
            productStmt.run(p.uuid, JSON.stringify(p));
        });
        productStmt.finalize();

        const masterStmt = db.prepare("INSERT OR REPLACE INTO product_masters (title, data) VALUES (?, ?)");
        for (const title in productMasters) {
            masterStmt.run(title, JSON.stringify(productMasters[title]));
        }
        masterStmt.finalize();

        res.json({ message: 'Data berhasil diimpor!' });
    });
});


// Endpoint untuk menyimpan perubahan (data master & produk)
app.post('/api/save', (req, res) => {
    const { products, productMasters } = req.body;

    db.serialize(() => {
        const productStmt = db.prepare("INSERT OR REPLACE INTO products (uuid, data) VALUES (?, ?)");
        products.forEach(p => {
            productStmt.run(p.uuid, JSON.stringify(p));
        });
        productStmt.finalize();

        const masterStmt = db.prepare("INSERT OR REPLACE INTO product_masters (title, data) VALUES (?, ?)");
        for (const title in productMasters) {
            masterStmt.run(title, JSON.stringify(productMasters[title]));
        }
        masterStmt.finalize();

        res.json({ message: 'Data berhasil disimpan!' });
    });
});

// Serve Halaman Utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'NIPPORI SYSTEM.html'));
});

app.listen(port, () => {
    console.log(`Aplikasi Nippori berjalan di http://localhost:${port}`);
});