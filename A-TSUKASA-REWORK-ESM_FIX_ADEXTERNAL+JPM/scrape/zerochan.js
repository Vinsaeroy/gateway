// scrape/zerochan.js
import axios from "axios"

class Zerochan {
  constructor() {
    this.is = axios.create({
      baseURL: "https://www.zerochan.net",
      headers: {
        "user-agent": "okhttp/3.14.9"
      }
    })
    this.bot = ""
  }

  async st() {
    if (!this.bot) {
      const { headers } = await this.is.get("/xbotcheck-image.svg")
      this.bot = headers["set-cookie"]?.[0]
      this.is.defaults.headers.cookie = this.bot
    } else {
      this.is.defaults.headers.cookie = this.bot
    }
  }

  async search(query) {
    await this.st()
    const { headers } = await this.is.get("/search", {
      validateStatus: () => true,
      maxRedirects: 0,
      params: { q: query }
    })

    const { data } = await this.is.get(headers.location, {
      params: {
        s: "recent",
        json: 1
      }
    })

    return data?.items || []
  }

  async detail(id) {
    await this.st()
    const { data } = await this.is.get(`/${id}`, {
      params: { json: 1 }
    })
    return data
  }
}

export default Zerochan