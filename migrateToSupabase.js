// migrateToSupabase.js
const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();

// GANTI DENGAN URL & KUNCI ANON ANDA!
const supabaseUrl = 'https://nawauitpgfucnxgndbxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hd2F1aXRwZ2Z1Y254Z25kYnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTc5NzAsImV4cCI6MjA3Mjc5Mzk3MH0.R40KvMCkl5U4rNsZ4KR9j_VnFA6Xakk0xDMCFLVfLaI';
const supabase = createClient(supabaseUrl, supabaseKey);

const db = new sqlite3.Database('./nippori.db');

async function migrate() {
    console.log('Memulai migrasi ke Supabase...');

    // Migrasi product_masters
    db.all("SELECT * FROM product_masters", [], async (err, rows) => {
        if (err) throw err;
        const masters = rows.map(row => ({
            title: row.title,
            data: JSON.parse(row.data)
        }));
        const { error } = await supabase.from('product_masters').upsert(masters);
        if (error) console.error('Error masters:', error);
        else console.log(`${rows.length} master produk berhasil dimigrasi.`);
    });

    // Migrasi products
    db.all("SELECT * FROM products", [], async (err, rows) => {
        if (err) throw err;
        const products = rows.map(row => {
            const data = JSON.parse(row.data);
            return {
                uuid: data.uuid,
                data: data
            }
        });
        const { error } = await supabase.from('products').upsert(products);
        if (error) console.error('Error products:', error);
        else console.log(`${rows.length} varian produk berhasil dimigrasi.`);
    });
}

migrate();