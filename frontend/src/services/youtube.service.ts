import type { YouTubeVideo } from '@/types'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export async function getLatestVideos(limit = 6): Promise<YouTubeVideo[]> {
  if (!API_URL) return []

  const response = await fetch(`${API_URL}/api/youtube/latest?limit=${limit}`)
  if (!response.ok) throw new Error('No se pudieron cargar los videos.')
  return response.json()
}
