// plugin/novel.js

export const command = ['novel', 'nv']
import ("../config.js")

export async function run(m, {
    riz,
    id,
    sender,
    pushname,
    isPremiumUser,
    getUserLimit,
    useUserLimit,
    DEFAULT_LIMIT,
    reply,
    q,
    msg,
    args,
    reactm
}) {
    try {        
    if (!q) {
            return reply(`❌ *Masukkan judul novel yang ingin dicari!*\n\nContoh:\n.novel jojo\n.nv romance`)
        }

        const senderNum = sender.split('@')[0]
        if (!isPremiumUser) {
            const bisa = useUserLimit(senderNum, 1)
            if (!bisa) {
                return reply(
                    `❌ Limit kamu sudah habis!\n\nSisa limit: ${getUserLimit(senderNum)}/${DEFAULT_LIMIT}\n\nHubungi owner untuk upgrade premium: ${global.owner || ''}`
                )
            }
            reply(`🔢 Limit terpakai 1x. Sisa limit: ${getUserLimit(senderNum)}/${DEFAULT_LIMIT}`)
        }

        await reactm('⏳')

        const apiUrl = `https://chocomilk.amira.us.kg/v1/novel/search?query=${encodeURIComponent(q)}`
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success || !data.data?.items || data.data.items.length === 0) {
            return reply(`❌ Tidak ditemukan novel dengan keyword "${q}"`)
        }

        const novels = data.data.items.slice(0, 5)
        
        let resultText = `📚 *HASIL PENCARIAN NOVEL*\n`
        resultText += `🔍 Keyword: *${q}*\n`
        resultText += `📊 Ditemukan: ${data.data.items.length} novel\n\n`

        novels.forEach((novel, index) => {
            resultText += `*${index + 1}. ${novel.title}*\n`
            resultText += `   👤 ${novel.author || 'Unknown'}\n`
            resultText += `   📖 ${novel.totalChapters || 0} Chapter\n`
            resultText += `   ⭐ ${novel.score || 'N/A'}\n`
            resultText += `   🏷️ ${novel.genres?.join(', ') || 'No Genre'}\n`
            
            let summary = novel.summary || 'No summary'
            if (summary.length > 250) {
                summary = summary.substring(0, 250) + '...'
            }
            resultText += `   📝 ${summary}\n\n`
        })

        resultText += `📌 Gunakan *.novel <judul>* untuk mencari novel lainnya`


        if (novels[0]?.cover?.url) {
            await riz.sendMessage(id, {
                image: { url: novels[0].cover.url },
                caption: `📖 *${novels[0].title}*\n\nCover novel pertama dari hasil pencarian`
            }, { quoted: msg })
        }

        await reactm('✅')

    } catch (error) {
        console.error('Novel Plugin Error:', error)
        await reactm('❌')
        reply(`❌ Gagal mencari novel: ${error.message}`)
    }
}