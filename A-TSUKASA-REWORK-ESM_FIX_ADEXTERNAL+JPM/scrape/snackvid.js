import axios from "axios";
import * as cheerio from "cheerio";

export async function SnackVideo(url) {
  try {
    const response = await axios.get(url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
    const html = response.data;

    const $ = cheerio.load(html);

    const videoObjectScript = $('script[type="application/ld+json"]').first().html();
    const videoData = JSON.parse(videoObjectScript);

    const nuxtScript = $('script').filter((i, el) =>
      $(el).html()?.includes('window.__NUXT__')
    ).first().html();

    const nuxtMatch = nuxtScript.match(/window\.__NUXT__=\(function\(([^)]+)\)\{return ([^}]+)\}\)/);
    let nuxtData = {};
    if (nuxtMatch) {
      nuxtData = JSON.parse(nuxtMatch[2]);
    }

    const photoList = nuxtData.data?.[0]?.photoList?.[0] || {};

    const result = {
      judul: videoData.description,
      kategori: videoData.genre || [],
      id_video: videoData.url?.split('/').pop() || url.split('/').pop(),
      durasi: videoData.duration?.replace('PT', '').replace('S', '') + ' detik',
      upload_date: new Date(videoData.uploadDate).toLocaleDateString('id-ID'),
      dimensi: `${videoData.width}x${videoData.height}`,

      statistik: {
        likes: photoList.like_count || videoData.interactionStatistic?.[1]?.userInteractionCount || 'N/A',
        comments: videoData.commentCount,
        shares: photoList.forward_count || videoData.interactionStatistic?.[2]?.userInteractionCount || 'N/A',
        views: photoList.view_count || videoData.interactionStatistic?.[0]?.userInteractionCount || 'N/A'
      },

      user: {
        username: videoData.creator?.mainEntity?.name,
        user_id: videoData.creator?.mainEntity?.identifier,
        bio: videoData.creator?.mainEntity?.description,
        followers: videoData.creator?.mainEntity?.interactionStatistic?.[1]?.userInteractionCount || 'N/A',
        total_likes: videoData.creator?.mainEntity?.interactionStatistic?.[0]?.userInteractionCount || 'N/A',
        verified: videoData.creator?.mainEntity?.verifiedNum ? 'Ya': 'Tidak'
      },

      media: {
        video_url: videoData.contentUrl,
        thumbnail: videoData.thumbnailUrl?.[0],
        avatar_user: videoData.creator?.mainEntity?.image
      }
    };

    return result;

  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}