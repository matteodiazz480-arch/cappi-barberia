import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

const steps = ['Servicio', 'Fecha y hora', 'Tus datos', 'Confirmación']

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso de la reserva">
      {steps.map((label, i) => {
        const stepIndex = i + 1
        const isDone = stepIndex < current
        const isActive = stepIndex === current

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                isDone && 'bg-ink-900 text-white',
                isActive && 'bg-ink-900 text-white',
                !isDone && !isActive && 'bg-ink-100 text-ink-400'
              )}
            >
              {isDone ? <Check className="size-3.5" /> : stepIndex}
            </div>
            {i < steps.length - 1 && (
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink-100">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-ink-900"
                  initial={false}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
