import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { YouTubeVideo } from '@/types'
import { formatDateShort } from '@/utils/format'

export function VideoCard({ video, onPlay }: { video: YouTubeVideo; onPlay: (v: YouTubeVideo) => void }) {
  return (
    <motion.button
      onClick={() => onPlay(video)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white text-left shadow-soft-sm transition-shadow hover:shadow-soft-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-ink-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-ink-900">
            <Play className="size-5 translate-x-0.5" fill="currentColor" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium text-ink-900">{video.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-ink-400">{formatDateShort(new Date(video.publishedAt))}</p>
          <span className="flex items-center gap-1 text-xs font-medium text-ink-600">
            <Play className="size-3" fill="currentColor" />
            Ver video
          </span>
        </div>
      </div>
    </motion.button>
  )
}
