import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";

const upVidey = async (file) => {
  try {
    if (!file) throw new Error("input required");
    if (!fs.existsSync(file)) throw new Error("file not found");

    const form = new FormData();
    form.append("file", fs.createReadStream(file), {
      filename: path.basename(file),
      contentType: "video/mp4"
    });

    const r = await axios.post(
      "https://videy.co/api/upload?visitorId=" + crypto.randomUUID(),
      form,
      {
        headers: {
          ...form.getHeaders(),
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
          origin: "https://videy.co",
          referer: "https://videy.co/",
          accept: "application/json"
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const id = r.data?.id;
    if (!id) throw new Error("upload gagal");

    return {
      id,
      link: r.data.link,
      cdn: `https://cdn.videy.co/${id}.mp4`
    };

  } catch (e) {
    return {
      status: "error",
      msg: e.message
    };
  }
};

export default upVidey;