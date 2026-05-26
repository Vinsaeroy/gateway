export const command = ["imgbb", "upimg", "img2url"]

import axios from "axios"
import FormData from "form-data"
import { downloadContentFromMessage } from "baileys"

const imgbbApiKey = "5487a2e6a937b4995f0b70c46b7bb85b"

export default async (m, { msg, reply, riz, qriz, id }) => {
    try {
        const quoted =
            msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quoted || !quoted.imageMessage) {
            return reply("❌ Reply *gambar* dengan command .imgbb / .upimg / .img2url")
        }

        await riz.sendMessage(id, {
            react: { text: "⏳", key: msg.key }
        })

        const stream = await downloadContentFromMessage(
            quoted.imageMessage,
            "image"
        )

        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length < 10) {
            throw new Error("Gagal mengambil gambar")
        }

        const base64Img = buffer.toString("base64")

        const form = new FormData()
        form.append("image", base64Img)
        form.append("name", `img_${Date.now()}`)

        const endpoint = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbApiKey)}`

        const upload = await axios.post(endpoint, form, {
            headers: {
                ...form.getHeaders(),
                Accept: "application/json"
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 30000,
            validateStatus: () => true
        })

        if (upload.status !== 200 || !upload.data?.success) {
            const err =
                upload.data?.error?.message ||
                upload.data?.error?.code ||
                `HTTP ${upload.status}`
            throw new Error(err)
        }

        const url = upload.data.data.url
        if (!url) throw new Error("URL kosong")

        await riz.sendMessage(
            id,
            {
                text: `✅ *Upload berhasil!*\n\n🔗 ${url}`
            },
            { quoted: qriz }
        )

        await riz.sendMessage(id, {
            react: { text: "✅", key: msg.key }
        })
    } catch (e) {
        console.error("IMGBB ERROR:", e?.response?.data || e)

        try {
            await riz.sendMessage(id, {
                react: { text: "❌", key: msg.key }
            })
        } catch {}

        reply(`❌ ${e?.message || "Gagal upload ke ImgBB"}`)
    }
}