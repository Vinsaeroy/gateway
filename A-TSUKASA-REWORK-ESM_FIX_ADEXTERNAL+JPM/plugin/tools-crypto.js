import axios from 'axios';

export const command = ["crypto"];

export default async function pluginRun(msg, ctx) {
    const { riz, id, sender, reply, q, args, qriz } = ctx;
    
    const coinInput = (q || "").toLowerCase().trim();

    if (!coinInput) {
        return reply(
            `💰 *CRYPTO PRICE CHECKER*\n\n` +
            `#crypto <coin>  → Cek harga coin\n` +
            `#crypto top    → Top 10 crypto\n\n` +
            `📊 *Contoh:*\n` +
            `.crypto bitcoin\n\n` +
            `💡 *Koin populer:*\n` +
            `bitcoin, ethereum, solana, xrp, dogecoin, cardano, shib`
        );
    }

    // TOP 10 
    if (coinInput === 'top') {
        try {
            await reply('🔄 Mengambil data top 10...');
            
            const response = await axios.get(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10',
                { timeout: 10000 }
            );
            
            let message = '🏆 *TOP 10 CRYPTO*\n\n';
            response.data.forEach((coin, i) => {
                const change = coin.price_change_percentage_24h || 0;
                const changeIcon = change >= 0 ? '📈' : '📉';
                const changeColor = change >= 0 ? '🟢' : '🔴';
                
                message += `${i + 1}. *${coin.name}* (${coin.symbol.toUpperCase()})\n`;
                message += `   💵 $${coin.current_price.toLocaleString()}\n`;
                message += `   ${changeIcon} ${changeColor} ${change.toFixed(2)}%\n\n`;
            });
            
            message += `📅 Update: ${new Date().toLocaleString('id-ID')}`;
            
            await reply(message);
        } catch (error) {
            console.error('[CRYPTO] Top 10 error:', error.message);
            await reply(
                '❌ Gagal mengambil data top 10.\n' +
                'Coba lagi nanti atau gunakan .crypto bitcoin'
            );
        }
        return;
    }

    try {
        await reply(`🔍 Mencari harga ${coinInput}...`);

        const coinMapping = {
            'xauusd': 'gold',
            'gold': 'gold',
            'emas': 'gold',
            'xagusd': 'silver',
            'silver': 'silver',
            'perak': 'silver',
            'btc': 'bitcoin',
            'bitcoin': 'bitcoin',
            'eth': 'ethereum',
            'ethereum': 'ethereum',
            'doge': 'dogecoin',
            'dogecoin': 'dogecoin',
            'ada': 'cardano',
            'cardano': 'cardano',
            'sol': 'solana',
            'solana': 'solana',
            'xrp': 'ripple',
            'ripple': 'ripple',
            'shib': 'shiba-inu',
            'shiba': 'shiba-inu',
            'shibainu': 'shiba-inu',
            'matic': 'matic-network',
            'polygon': 'matic-network'
        };

        const coinId = coinMapping[coinInput] || coinInput;

        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,idr&include_24hr_change=true`,
            { timeout: 10000 }
        );

        if (!response.data[coinId]) {
            return reply(
                `❌ Koin "${coinInput}" tidak ditemukan.\n` +
                `Coba: .crypto top untuk melihat daftar koin.`
            );
        }

        const data = response.data[coinId];
        const change = data.usd_24h_change || 0;
        const changeIcon = change >= 0 ? '📈' : '📉';
        const changeColor = change >= 0 ? '🟢' : '🔴';

        await reply(
            `💰 *${coinId.toUpperCase()} PRICE*\n\n` +
            `💵 USD: $${data.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
            `🇮🇩 IDR: Rp ${data.idr.toLocaleString('id-ID')}\n` +
            `${changeIcon} 24h: ${changeColor} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%\n\n` +
            `🏦 Sumber: CoinGecko\n` +
            `⏰ ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
        );

    } catch (error) {
        console.error('[CRYPTO] Error:', error.message);
        await reply(
            `❌ Gagal mengambil data ${coinInput}.\n\n` +
            `*Kemungkinan:*\n` +
            `• Koin tidak dikenal\n` +
            `• API sedang limit\n` +
            `• Koneksi internet\n\n` +
            `Coba:\n` +
            `1. .crypto bitcoin (untuk test)\n` +
            `2. .crypto top (lihat daftar)`
        );
    }
}