import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useClientAuth } from '@/context/ClientAuthContext'
import { useToast } from '@/context/ToastContext'
import { clientLoginSchema, type ClientLoginValues } from '@/utils/validation'

export function ClientLoginPage() {
  const { isAuthenticated, login } = useClientAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientLoginValues>({ resolver: zodResolver(clientLoginSchema) })

  if (isAuthenticated) return <Navigate to="/cuenta" replace />

  const onSubmit = async (values: ClientLoginValues) => {
    setIsSubmitting(true)
    try {
      await login(values)
      navigate('/cuenta', { replace: true })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo iniciar sesión.', 'error')
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
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mi cuenta</h1>
          <p className="mt-1.5 text-[15px] text-ink-500">Ingresá con tu teléfono para ver tus turnos.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft-sm"
          noValidate
        >
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
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" className="w-full gap-2" isLoading={isSubmitting}>
            <LogIn className="size-4" />
            Ingresar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          ¿Todavía no tenés cuenta?{' '}
          <Link to="/cuenta/registro" className="font-medium text-ink-900 hover:underline">
            Registrate
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
