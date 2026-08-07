import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlaySquare } from 'lucide-react'
import { getLatestVideos } from '@/services/youtube.service'
import { VideoCard } from './VideoCard'
import { VideoModal } from './VideoModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { YouTubeVideo } from '@/types'

export function LatestVideos({ limit = 6 }: { limit?: number }) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null)

  const { data: videos, isLoading } = useQuery({
    queryKey: ['youtube-videos', limit],
    queryFn: () => getLatestVideos(limit),
    staleTime: 10 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-3xl" />
        ))}
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        icon={PlaySquare}
        title="Todavía no hay videos disponibles"
        description="Muy pronto vas a poder ver acá los últimos videos del canal."
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
        ))}
      </div>
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </>
  )
}
