import { ImageIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200 text-ink-400',
        className
      )}
    >
      <ImageIcon className="size-8" strokeWidth={1.5} />
    </div>
  )
}
