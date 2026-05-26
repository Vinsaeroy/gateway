// ./scrape/pinterest.js
import fetch from "node-fetch";

export const pinterest = {
  getData: async function (pinterestUrl) {
    const pinterestId = await this.getPinterestIdFromUrl(pinterestUrl)
    const res = await fetch("https://id.pinterest.com/_/graphql/", {
      "headers": {
        "accept-encoding": "gzip, deflate, br, zstd",
        "content-type": "application/json",
        "cookie": "csrftoken=f199c374cd68fda2595b9cc9bb9c7d5d;}",
        "x-csrftoken": "f199c374cd68fda2595b9cc9bb9c7d5d",
      },
      "body": JSON.stringify({
        "queryHash": "91dc7817f1acf1c2fb8d505d1c79dedebcb3baa1794065ba3602b843099f8ff7",
        "variables": {
          "pinId": pinterestId,
          "isAuth": false,
          "isDesktop": true,
          "shouldPrefetchStoryPinFragment": false,
          "isUnauth": true
        }
      }),
      "method": "POST",
    })
    if (!res.ok) throw Error(`${res.status} ${res.statusText} on ${res.url}`)
    const json = await res.json()
    return this.serialize(json)
  },
  serialize: function (pinterestResponse) {
    const data = pinterestResponse.data.v3GetPinQuery.data
    const post = {
      title: data?.unauthOnPageTitle?.trim() || '(no title)',
      description: data?.description?.trim() || '',
      likesCount: data?.totalReactionCount || 0,
      shareCount: data?.shareCount || 0,
      commentCount: data?.aggregatedPinData?.commentCount || 0,
      createdAt: data?.createdAt || '(unknown)'
    }
    const user = {
      fullName: data?.originPinner?.fullName || '(unknown)',
      username: data?.originPinner?.username || '(unknown)'
    }
    const v = data?.storyPinData?.pages?.[0]?.blocks?.[0]?.videoDataV2?.videoList720P?.v720P ||
      data?.videos?.videoList?.v720P
    const content = {
      images: Object.keys(data).filter(k => k.startsWith('images_')).map(k => ({ ...data[k], name: k.replace('images_', '') })),
      videos: v ? [v] : []
    }
    return { user, post, content }
  },
  getPinterestIdFromUrl: async function (pinterestUrl) {
    const shortUrl = /pin\.it/i.test(pinterestUrl)
    let utext 
    if (shortUrl) {
      const r = await fetch(pinterestUrl, { method: 'head', redirect: 'follow', })
      utext = r.url
    } else {
      const validHostname = /pinterest/i.test(pinterestUrl)
      if (!validHostname) throw Error(`${pinterestUrl} invalid. hostname invalid`)
      utext = pinterestUrl
    }
    const url = new URL(utext)
    const pinId = url.pathname.match(/\/pin\/(\d+)/)?.[1]
    if (!pinId) throw Error(`${pinterestUrl} invalid. cant parse pinterest id`)
    return pinId
  }
}