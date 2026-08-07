import { XMLParser } from 'fast-xml-parser'

const CACHE_TTL_MS = 10 * 60 * 1000
const CHANNEL_ID_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  duration: string
  url: string
}

interface CacheEntry {
  expiresAt: number
  videos: YouTubeVideo[]
}

const videosCache = new Map<number, CacheEntry>()
let channelIdCache: { id: string; expiresAt: number } | null = null

/**
 * Resuelve el channel_id (UCxxxxxxxx) real a partir de un @handle o de un ID
 * ya resuelto, sin necesidad de la YouTube Data API: lee el <link
 * rel="canonical"> de la página pública del canal, que siempre apunta a
 * /channel/UCxxxx. Se cachea 24hs porque el channel_id de un canal no cambia.
 */
async function resolveChannelId(handleOrId: string): Promise<string> {
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(handleOrId)) return handleOrId

  if (channelIdCache && channelIdCache.expiresAt > Date.now()) {
    return channelIdCache.id
  }

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

  channelIdCache = { id: match[1], expiresAt: Date.now() + CHANNEL_ID_CACHE_TTL_MS }
  return match[1]
}

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Trae los últimos videos vía el feed RSS público de YouTube
 * (https://www.youtube.com/feeds/videos.xml?channel_id=...), que no requiere
 * API key ni cuota. No incluye duración (el RSS no la expone); se omite en
 * el resultado y el frontend simplemente no la muestra.
 */
export async function getLatestVideos(limit: number): Promise<YouTubeVideo[]> {
  const channelIdOrHandle = process.env.YOUTUBE_CHANNEL_ID || '@CappiYutu'

  const cached = videosCache.get(limit)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.videos
  }

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

  const videos: YouTubeVideo[] = entries.map((entry) => {
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

  videosCache.set(limit, { videos, expiresAt: Date.now() + CACHE_TTL_MS })
  return videos
}
