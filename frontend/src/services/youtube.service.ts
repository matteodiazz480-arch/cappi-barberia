import type { YouTubeVideo } from '@/types'

// Ruta relativa: en producción la resuelve la función serverless en
// frontend/api/youtube/latest.ts (mismo dominio); en desarrollo local el
// proxy de Vite (ver vite.config.ts) la redirige al backend Express.
export async function getLatestVideos(limit = 6): Promise<YouTubeVideo[]> {
  const response = await fetch(`/api/youtube/latest?limit=${limit}`)
  if (!response.ok) throw new Error('No se pudieron cargar los videos.')
  return response.json()
}
