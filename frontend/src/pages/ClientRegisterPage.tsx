import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useClientAuth } from '@/context/ClientAuthContext'
import { useToast } from '@/context/ToastContext'
import { clientRegisterSchema, type ClientRegisterValues } from '@/utils/validation'

export function ClientRegisterPage() {
  const { isAuthenticated, register: registerClient } = useClientAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientRegisterValues>({ resolver: zodResolver(clientRegisterSchema) })

  if (isAuthenticated) return <Navigate to="/cuenta" replace />

  const onSubmit = async (values: ClientRegisterValues) => {
    setIsSubmitting(true)
    try {
      await registerClient(values)
      showToast('¡Cuenta creada!', 'success')
      navigate('/cuenta', { replace: true })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo crear la cuenta.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Creá tu cuenta</h1>
          <p className="mt-1.5 text-[15px] text-ink-500">
            Guardá tus turnos y accedé a tu historial cuando quieras.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft-sm"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre" placeholder="Juan" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Apellido" placeholder="Pérez" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+54 9 11 1234 5678"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" className="w-full gap-2" isLoading={isSubmitting}>
            <UserPlus className="size-4" />
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/cuenta/login" className="font-medium text-ink-900 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
