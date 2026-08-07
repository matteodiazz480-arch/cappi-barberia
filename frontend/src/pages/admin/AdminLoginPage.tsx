import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import logo from '@/assets/logo.png'

const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export function AdminLoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin'
    return <Navigate to={from} replace />
  }

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true)
    try {
      await signIn(values.email, values.password)
      navigate('/admin', { replace: true })
    } catch {
      showToast('Email o contraseña incorrectos.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink-50 px-5">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent-100/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-10 flex flex-col items-center gap-5 text-center">
          <motion.img
            src={logo}
            alt="Cappi Barbería"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-16 w-auto object-contain sm:h-20"
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
              Panel administrador
            </h1>
            <p className="mt-1.5 text-[15px] text-ink-500">
              Ingresá tus credenciales para continuar.
            </p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-[28px] border border-ink-100 bg-white p-8 shadow-soft-lg"
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="admin@tubarberia.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" className="w-full gap-2" isLoading={isSubmitting}>
            <Lock className="size-4" />
            Ingresar
          </Button>
        </motion.form>
      </motion.div>
    </div>
  )
}
