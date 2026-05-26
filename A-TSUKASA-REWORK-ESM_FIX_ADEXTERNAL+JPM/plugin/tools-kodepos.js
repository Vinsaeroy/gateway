// plugin/kodepos-simple.js
import axios from 'axios';
import * as cheerio from 'cheerio';

export const command = ['kodepos', 'pos', 'cekpos'];
export default async function kodeposPlugin(msg, ctx) {
    const { q, reply, reactm, usedPrefix, command } = ctx;
    
    if (!q) {
        return reply(`❌ Contoh: ${usedPrefix}${command} Jakarta Pusat`);
    }
    
    await reactm('🔍');
    
    try {
        const data = await getKodepos(q);
        
        if (!data.length) {
            await reactm('❌');
            return reply(`❌ "${q}" tidak ditemukan.\nCoba dengan nama yang lebih spesifik.`);
        }
        
        let text = `📮 *KODE POS:* ${q}\n\n`;
        
        data.slice(0, 5).forEach((v, i) => {
            text += `*${i + 1}. ${v.urban || v.subdistrict}*\n`;
            text += `📍 ${v.subdistrict}, ${v.city}\n`;
            text += `📮 *${v.postalcode}*\n`;
            text += `🌐 ${v.province}\n\n`;
        });
        
        if (data.length > 5) {
            text += `📌 ${data.length - 5} hasil lain tidak ditampilkan`;
        }
        
        await reply(text.trim());
        await reactm('✅');
        
    } catch (e) {
        await reactm('❌');
        reply(`❌ Error: ${e.message}`);
    }
}

async function getKodepos(daerah) {
    const url = `https://carikodepos.com/?s=${encodeURIComponent(daerah)}`;
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
        }
    });
    
    const $ = cheerio.load(data);
    const results = [];
    
    $('table.table tbody tr').each((i, row) => {
        if (i === 0) return;
        const cols = $(row).find('td');
        
        if (cols.length >= 5) {
            results.push({
                province: $(cols[0]).text().trim(),
                city: $(cols[1]).text().trim(),
                subdistrict: $(cols[2]).text().trim(),
                urban: $(cols[3]).text().trim(),
                postalcode: $(cols[4]).text().trim()
            });
        }
    });
    
    return results;
}