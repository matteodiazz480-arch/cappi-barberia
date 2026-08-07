import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { Service } from '@/types'
import { formatDuration, formatPrice } from '@/utils/format'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

interface ServiceCardProps {
  service: Service
  onSelect?: (service: Service) => void
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft-sm transition-shadow hover:shadow-soft-md"
    >
      {service.image_url ? (
        <img
          src={service.image_url}
          alt={service.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <ImagePlaceholder className="h-40 w-full" />
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-ink-900">{service.name}</h3>
        {service.description && (
          <p className="line-clamp-2 text-sm text-ink-500">{service.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="flex items-center gap-1 text-sm text-ink-400">
            <Clock className="size-3.5" />
            {formatDuration(service.duration_minutes)}
          </span>
          <span className="font-semibold text-ink-900">{formatPrice(service.price)}</span>
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(service)}
            className="mt-3 h-10 w-full rounded-full bg-ink-900 text-sm font-medium text-white transition-transform active:scale-[0.97]"
          >
            Reservar este servicio
          </button>
        )}
      </div>
    </motion.article>
  )
}
