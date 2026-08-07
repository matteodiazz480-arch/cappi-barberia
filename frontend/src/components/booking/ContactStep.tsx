import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { contactFormSchema, type ContactFormValues } from '@/utils/validation'

interface ContactStepProps {
  defaultValues: ContactFormValues
  onSubmit: (values: ContactFormValues) => void
  isSubmitting: boolean
}

export function ContactStep({ defaultValues, onSubmit, isSubmitting }: ContactStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      <Textarea
        label="Observaciones (opcional)"
        placeholder="Contame si necesitás algo en particular"
        error={errors.notes?.message}
        {...register('notes')}
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        Confirmar turno
      </Button>
    </form>
  )
}
