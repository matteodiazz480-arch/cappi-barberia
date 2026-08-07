import { XMLParser } from 'fast-xml-parser'

// Vercel Edge Function: /api/youtube/latest
// Reemplaza al backend Express standalone en producción (Vercel despliega
// este archivo automáticamente al detectar la carpeta /api). En desarrollo
// local seguís pudiendo usar `backend/` con `npm run dev:backend` — el
// proxy de Vite en vite.config.ts redirige /api hacia ese servidor.

export const config = { runtime: 'edge' }

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  duration: string
  url: string
}

/**
 * Resuelve el channel_id (UCxxxxxxxx) real a partir de un @handle, sin
 * necesidad de la YouTube Data API: lee el <link rel="canonical"> de la
 * página pública del canal, que siempre apunta a /channel/UCxxxx.
 */
async function resolveChannelId(handleOrId: string): Promise<string> {
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(handleOrId)) return handleOrId

  const handlePath = handleOrId.startsWith('@') ? handleOrId : `@${handleOrId}`
  const response = await fetch(`https://www.youtube.com/${handlePath}`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`No se pudo acceder al canal de YouTube (${response.status}).`)
  }

  const html = await response.text()
  const match = /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/.exec(
    html
  )

  if (!match) {
    throw new Error('No se pudo resolver el ID del canal de YouTube.')
  }

  return match[1]
}

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Trae los últimos videos vía el feed RSS público de YouTube, sin API key
 * ni cuota. No incluye duración (el RSS no la expone).
 */
async function getLatestVideos(limit: number): Promise<YouTubeVideo[]> {
  const channelIdOrHandle = process.env.YOUTUBE_CHANNEL_ID || '@CappiYutu'
  const channelId = await resolveChannelId(channelIdOrHandle)

  const feedResponse = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    { headers: { 'User-Agent': USER_AGENT } }
  )

  if (!feedResponse.ok) {
    throw new Error(`No se pudo obtener el feed de YouTube (${feedResponse.status}).`)
  }

  const xml = await feedResponse.text()
  const parsed = xmlParser.parse(xml)
  const entries = toArray(parsed?.feed?.entry).slice(0, limit)

  return entries.map((entry) => {
    const videoId = entry['yt:videoId']
    const mediaGroup = entry['media:group'] ?? {}
    const thumbnail = mediaGroup['media:thumbnail']?.['@_url']

    return {
      id: videoId,
      title: entry.title,
      thumbnail: thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: entry.published,
      duration: '',
      url: `https://www.youtube.com/watch?v=${videoId}`,
    }
  })
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const limit = Math.min(Number(url.searchParams.get('limit')) || 6, 20)

  try {
    const videos = await getLatestVideos(limit)
    return new Response(JSON.stringify(videos), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        // Cachea 10 min en el edge de Vercel; sirve versión vieja mientras revalida.
        'cache-control': 's-maxage=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
