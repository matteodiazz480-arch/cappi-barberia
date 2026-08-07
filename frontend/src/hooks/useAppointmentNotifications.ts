import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToNewAppointments } from '@/services/appointments.service'
import { useToast } from '@/context/ToastContext'

export function useAppointmentNotifications() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToNewAppointments(() => {
      showToast('¡Nuevo turno reservado!', 'success')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    return unsubscribe
  }, [queryClient, showToast])
}
