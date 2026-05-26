import { createCanvas, loadImage } from "canvas"
import { downloadContentFromMessage } from "baileys"

export const command = ["mpls"]

export default async function pluginRun(msg, ctx) {
    const { riz, id, reply, quoted, qriz } = ctx

    // ===== VALIDASI QUOTED =====
    const q = quoted?.quotedMessage
    if (!q) {
        return reply("📷 Harap *reply* ke gambar yang ingin ditempel Twibbon MPLS.")
    }

    const type = Object.keys(q).find(v =>
        ["imageMessage", "stickerMessage", "videoMessage"].includes(v)
    )

    if (!type) {
        return reply("❌ Media tidak didukung. Gunakan gambar / sticker.")
    }

    reply("⏳ Sedang membuat Twibbon MPLS 2025...")

    try {
        // ===== DOWNLOAD MEDIA =====
        const stream = await downloadContentFromMessage(
            q[type],
            type.replace("Message", "")
        )

        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer.length) {
            return reply("❌ Gagal mengambil media.")
        }

        // ===== LOAD IMAGE =====
        const twibbonURL =
            "https://raw.githubusercontent.com/Rizkygamers/waifuim-img/main/uploads/image-1769187946496.jpg"

        const fotoUser = await loadImage(buffer)
        const twibbon = await loadImage(twibbonURL)

        // ===== CANVAS =====
        const canvas = createCanvas(twibbon.width, twibbon.height)
        const ctx2d = canvas.getContext("2d")

        // ===== CIRCLE MASK SETTING =====
        const circleX = 600
        const circleY = 533
        const radius = 420

        // ===== AUTO CROP SQUARE =====
        const aspect = fotoUser.width / fotoUser.height
        let srcX, srcY, srcW, srcH

        if (aspect > 1) {
            srcH = fotoUser.height
            srcW = fotoUser.height
            srcX = (fotoUser.width - srcW) / 2
            srcY = 0
        } else {
            srcW = fotoUser.width
            srcH = fotoUser.width
            srcX = 0
            srcY = (fotoUser.height - srcH) / 2
        }

        // ===== DRAW FOTO (CLIP CIRCLE) =====
        ctx2d.save()
        ctx2d.beginPath()
        ctx2d.arc(circleX, circleY, radius, 0, Math.PI * 2)
        ctx2d.closePath()
        ctx2d.clip()

        ctx2d.drawImage(
            fotoUser,
            srcX,
            srcY,
            srcW,
            srcH,
            circleX - radius,
            circleY - radius,
            radius * 2,
            radius * 2
        )

        ctx2d.restore()

        // ===== DRAW TWIBBON =====
        ctx2d.drawImage(twibbon, 0, 0)

        // ===== OUTPUT =====
        const result = canvas.toBuffer("image/png")

        await riz.sendMessage(
            id,
            {
                image: result,
                caption:
                    "📸 *Twibbon MPLS 2025 siap!*\n\n" +
                    "✨ Fitur:\n" +
                    "• Auto crop & resize\n" +
                    "• Frame lingkaran presisi\n" +
                    "• Kualitas HD"
            },
            { quoted: qriz }
        )
    } catch (err) {
        console.error("[MPLS ERROR]", err)
        reply("❌ Gagal membuat Twibbon MPLS:\n" + (err.message || "Unknown error"))
    }
}