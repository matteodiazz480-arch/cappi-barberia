import { Modal } from '@/components/ui/Modal'
import type { YouTubeVideo } from '@/types'

export function VideoModal({ video, onClose }: { video: YouTubeVideo | null; onClose: () => void }) {
  return (
    <Modal isOpen={!!video} onClose={onClose} title={video?.title} className="sm:max-w-2xl">
      {video && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </Modal>
  )
}
