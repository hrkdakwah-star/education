const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Daftar halaman yang akan dikerok datanya
const categories = [
    { name: 'Godly', url: 'https://supremevaluelist.com/mm2/godlies' },
    { name: 'Ancient', url: 'https://supremevaluelist.com/mm2/ancients' },
    { name: 'Vintage', url: 'https://supremevaluelist.com/mm2/vintages' },
    { name: 'Legendary', url: 'https://supremevaluelist.com/mm2/legendaries' },
    { name: 'Unique', url: 'https://supremevaluelist.com/mm2/uniques' }
];

async function scrapeAll() {
    let allItems = [];
    console.log("🚀 Memulai proses pengambilan data...");

    for (let cat of categories) {
        try {
            // Nyamar jadi browser asli biar nggak di-block Supreme
            const { data } = await axios.get(cat.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
            });
            const $ = cheerio.load(data);

            $('.item-row').each((i, el) => {
                const name = $(el).find('.item-name').text().trim();
                const value = $(el).find('.value-number').text().trim();
                const demand = $(el).find('.demand-stat').text().trim() || "N/A";
                const stability = $(el).find('.stability-stat').text().trim() || "Stable";
                
                if (name && value) {
                    allItems.push({
                        name: name,
                        value: value,
                        demand: demand,
                        rarity: name.toLowerCase().includes('chroma') ? 'Chroma' : cat.name,
                        stability: stability
                    });
                }
            });
            console.log(`✅ Kategori ${cat.name} Selesai.`);
        } catch (e) {
            console.log(`❌ Gagal di ${cat.name}: ${e.message}`);
        }
    }

    // Tulis hasilnya ke file JSON
    fs.writeFileSync('data-value.json', JSON.stringify(allItems, null, 2));
    console.log("🔥 Database Berhasil Disimpan!");
}

scrapeAll();
