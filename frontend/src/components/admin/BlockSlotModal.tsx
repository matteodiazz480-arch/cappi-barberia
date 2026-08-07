import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toDateInputValue } from '@/utils/format'

interface BlockSlotModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (input: { startsAt: string; endsAt: string; reason: string; isFullDay: boolean }) => void
  isSaving: boolean
}

export function BlockSlotModal({ isOpen, onClose, onCreate, isSaving }: BlockSlotModalProps) {
  const today = toDateInputValue(new Date())
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [fromTime, setFromTime] = useState('09:00')
  const [toTime, setToTime] = useState('19:00')
  const [isFullDay, setIsFullDay] = useState(true)
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    const startsAt = isFullDay
      ? new Date(`${fromDate}T00:00:00`)
      : new Date(`${fromDate}T${fromTime}:00`)
    const endsAt = isFullDay
      ? new Date(`${toDate}T23:59:59`)
      : new Date(`${fromDate}T${toTime}:00`)

    onCreate({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      reason,
      isFullDay,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bloquear horario">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsFullDay(true)}
            className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              isFullDay ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 text-ink-600'
            }`}
          >
            Día(s) completo(s)
          </button>
          <button
            onClick={() => setIsFullDay(false)}
            className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              !isFullDay ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 text-ink-600'
            }`}
          >
            Horario específico
          </button>
        </div>

        {isFullDay ? (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Desde" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input label="Hasta" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Input label="Fecha" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input label="Desde" type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
            <Input label="Hasta" type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
          </div>
        )}

        <Input
          label="Motivo (opcional)"
          placeholder="Vacaciones, cierre, feriado…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Button className="w-full" size="lg" onClick={handleSubmit} isLoading={isSaving}>
          Bloquear
        </Button>
      </div>
    </Modal>
  )
}
