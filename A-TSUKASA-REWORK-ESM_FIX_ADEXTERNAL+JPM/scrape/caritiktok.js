import axios from "axios";

export async function ttSearch(query) {
  let response = await axios('https://tikwm.com/api/feed/search', {
    method: 'POST',
    data: {
      keywords: query,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": "current_langange=en;",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
    }
  })
  let date = response.data.data
  let video = date.videos
  if (video.length === 0) {
    reject('Tidak Ada Video Yang Di Temukan!')
  } else {
    let all = Math.floor(Math.random() * video.length);
    let a = {
      status: true,
      creator: 'Nuyy-Ofc',
      result: {
        video_id: video[all].video_id,
        region: video[all].region,
        title: video[all].title,
        author: video[all].author.unique_id,
        nickname: video[all].author.nickname,
        profile: 'https://tikwm.com' + video[all].author.avatar,
        cover: 'https://tikwm.com' + video[all].cover,
        play: 'https://tikwm.com' + video[all].play,
        wm_play: 'https://tikwm.com' + video[all].wmplay,
        music: 'https://tikwm.com' + video[all].music,
        music_info: {
          id: video[all].music_info.id,
          title: video[all].music_info.title,
          play_music: video[all].music_info.play
        }
      }
    }
    return a;
  }
  return;
}