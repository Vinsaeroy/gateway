export const command = ["cogan"]

export default async (m, {
  riz, reply, qriz, id
}) => {
  try {
    const api = "https://api.alpin-store.my.id/api/cogan/random?apikey=alpinstr"
    const res = await fetch(api)

    if (!res.ok) throw new Error("Gagal fetch API")

    const data = await res.json()

    if (!data.result) throw new Error("Gagal ambil URL gambar")

    await riz.sendMessage(
      id,
      {
        image: {
          url: data.result
        },
        caption: "Nih cogan random buat lu, ganteng kan?"
      },
      {
        quoted: qriz
      }
    )
  } catch (e) {
    console.error(e)
    reply("⚠️ Gagal ngambil gambar cogan, coba lagi bentar...")
  }
}