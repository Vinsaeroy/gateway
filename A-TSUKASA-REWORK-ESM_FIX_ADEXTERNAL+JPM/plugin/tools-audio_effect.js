export const command = [
  "bass",
  "blown",
  "chipmunk",
  "deep",
  "earrape",
  "fast",
  "fat",
  "nightcore",
  "reverse",
  "robot",
  "slow",
  "smooth"
]

import fs from "fs"
import { exec } from "child_process"
import { downloadContentFromMessage } from "baileys"

export default async (m, { riz, id, reply, msg, body, qriz }) => {

  const cmd = body?.split(" ")[0]?.replace(".", "")
  if (!command.includes(cmd)) return

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const type = quoted ? Object.keys(quoted)[0] : null

  if (!quoted || type !== "audioMessage") {
    return reply("⚠️ Reply audio/voice note dulu lah bang.")
  }

  const stream = await downloadContentFromMessage(quoted.audioMessage, "audio")
  let buffer = Buffer.from([])
  for await (const c of stream) buffer = Buffer.concat([buffer, c])

  const input = `./temp_in_${Date.now()}.mp3`
  const output = `./temp_out_${Date.now()}.mp3`
  fs.writeFileSync(input, buffer)

  const fx = {
    bass:      "equalizer=f=70:width_type=o:width=2:g=25",
    blown:     "acrusher=level_in=1:level_out=5:bits=8:mode=log:aa=1",
    chipmunk:  "asetrate=44100*1.5,aresample=44100",
    deep:      "asetrate=44100*0.7,aresample=44100,atempo=0.8",
    earrape:   "volume=30",
    fast:      "atempo=1.5",
    fat:       "asetrate=44100*0.8,aresample=44100",
    nightcore: "asetrate=48000*1.25,aresample=48000,atempo=1.1",
    reverse:   "areverse",
    robot:     "afftfilt=real='hypot(re,im)':imag='atan2(im,re)'",
    slow:      "atempo=0.7",
    smooth:    "afftfilt=real='re*0.8':imag='im*0.8'"
  }

  exec(`ffmpeg -y -i ${input} -af "${fx[cmd]}" ${output}`, async (err) => {

    fs.unlinkSync(input)

    if (err) {
      console.log(err)
      return reply("❌ ffmpeg error, efek gagal diproses.")
    }

    const result = fs.readFileSync(output)

    await riz.sendMessage(
      id,
      { audio: result, mimetype: "audio/mpeg", ptt: false },
      { quoted: qriz }
    )

    fs.unlinkSync(output)
  })
}