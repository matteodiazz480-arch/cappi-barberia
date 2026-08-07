import { LatestVideos } from '@/components/videos/LatestVideos'
import { BUSINESS_DEFAULTS } from '@/config/business'

export function VideosPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-6 pb-16 lg:max-w-6xl lg:px-8 lg:pt-14 lg:pb-24">
      <div className="space-y-2 lg:max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 lg:text-5xl">
          Últimos videos
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-500 lg:text-lg">
          Mirá los últimos cortes y contenido del canal de YouTube.
        </p>
      </div>

      <div className="mt-8 lg:mt-12">
        <LatestVideos limit={9} />
      </div>

      <div className="mt-8 flex justify-center lg:mt-12">
        <a
          href={BUSINESS_DEFAULTS.youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-full bg-ink-100 px-6 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-200"
        >
          Ver todos los videos
        </a>
      </div>
    </div>
  )
}
