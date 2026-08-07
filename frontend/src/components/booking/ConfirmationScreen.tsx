import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, Home, Scissors, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDateLong, formatTime } from '@/utils/format'

interface ConfirmationScreenProps {
  serviceName: string
  startsAt: string
}

export function ConfirmationScreen({ serviceName, startsAt }: ConfirmationScreenProps) {
  const date = new Date(startsAt)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="flex flex-col items-center gap-6 py-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="flex size-20 items-center justify-center rounded-full bg-emerald-50"
      >
        <CheckCircle2 className="size-10 text-emerald-600" strokeWidth={1.75} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900">¡Turno confirmado!</h2>
        <p className="text-[15px] text-ink-500">Te esperamos, ¡nos vemos pronto!</p>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-3xl border border-ink-100 bg-white p-5 text-left shadow-soft-sm">
        <div className="flex items-center gap-3">
          <Scissors className="size-5 text-ink-400" />
          <span className="text-[15px] font-medium text-ink-800">{serviceName}</span>
        </div>
        <div className="flex items-center gap-3">
          <CalendarClock className="size-5 text-ink-400" />
          <span className="text-[15px] font-medium capitalize text-ink-800">
            {formatDateLong(date)} · {formatTime(date)} hs
          </span>
        </div>
      </div>

      <Link to="/" className="w-full max-w-sm">
        <Button variant="secondary" size="lg" className="w-full gap-2">
          <Home className="size-5" />
          Volver al inicio
        </Button>
      </Link>
    </motion.div>
  )
}
