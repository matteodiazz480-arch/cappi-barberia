import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { ServiceStep } from '@/components/booking/ServiceStep'
import { DateTimeStep } from '@/components/booking/DateTimeStep'
import { ContactStep } from '@/components/booking/ContactStep'
import { ConfirmationScreen } from '@/components/booking/ConfirmationScreen'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { Button } from '@/components/ui/Button'
import { createAppointment } from '@/services/booking.service'
import { getActiveServices } from '@/services/services.service'
import { useToast } from '@/context/ToastContext'
import { toDateInputValue } from '@/utils/format'
import type { ContactFormValues } from '@/utils/validation'
import type { Service } from '@/types'

type LocationState = { serviceId?: string } | null

export function BookingPage() {
  const location = useLocation()
  const state = location.state as LocationState

  const [step, setStep] = useState(1)
  const [service, setService] = useState<Service | null>(null)
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [time, setTime] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{ serviceName: string; startsAt: string } | null>(
    null
  )
  const { showToast } = useToast()

  // Comparte cache con ServiceStep (misma queryKey): permite preseleccionar
  // automáticamente el servicio elegido en /servicios sin pedirle al usuario
  // que lo vuelva a tocar.
  const { data: activeServices } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: getActiveServices,
  })

  useEffect(() => {
    if (service || !state?.serviceId || !activeServices) return
    const preselected = activeServices.find((s) => s.id === state.serviceId)
    if (preselected) setService(preselected)
  }, [activeServices, state?.serviceId, service])

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: (result) => {
      setConfirmation({ serviceName: result.service_name, startsAt: result.starts_at })
    },
    onError: (error: Error) => {
      showToast(error.message || 'No se pudo reservar el turno. Intentá de nuevo.', 'error')
    },
  })

  const canGoNext =
    (step === 1 && !!service) || (step === 2 && !!date && !!time) || step === 3

  const handleContactSubmit = (values: ContactFormValues) => {
    if (!service || !time) return
    mutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      notes: values.notes,
      serviceId: service.id,
      date,
      time,
    })
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-6 lg:max-w-xl lg:pt-16">
        <ConfirmationScreen serviceName={confirmation.serviceName} startsAt={confirmation.startsAt} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-5 pt-10 pb-4 lg:max-w-4xl lg:pt-16">
      <div className="lg:flex lg:items-start lg:gap-12">
        <div className="lg:flex-1">
          <div className="mb-6 flex items-center gap-3 lg:mb-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100"
                aria-label="Volver al paso anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-900 lg:text-3xl">
                Reservar turno
              </h1>
              <p className="text-sm text-ink-500">Completá los pasos para confirmar tu cita.</p>
            </div>
          </div>

          <div className="mb-8">
            <StepIndicator current={step} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && (
                <ServiceStep
                  selectedServiceId={service?.id ?? state?.serviceId ?? null}
                  onSelect={setService}
                />
              )}

              {step === 2 && service && (
                <DateTimeStep
                  serviceDurationMinutes={service.duration_minutes}
                  selectedDate={date}
                  selectedTime={time}
                  onSelectDate={(d) => {
                    setDate(d)
                    setTime(null)
                  }}
                  onSelectTime={setTime}
                />
              )}

              {step === 3 && (
                <ContactStep
                  defaultValues={{ firstName: '', lastName: '', phone: '', notes: '' }}
                  onSubmit={handleContactSubmit}
                  isSubmitting={mutation.isPending}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {step < 3 && (
            <div className="mt-8">
              <Button
                size="lg"
                className="w-full"
                disabled={!canGoNext}
                onClick={() => setStep((s) => s + 1)}
              >
                Continuar
              </Button>
            </div>
          )}
        </div>

        <BookingSummary service={service} date={date} time={time} />
      </div>
    </div>
  )
}
