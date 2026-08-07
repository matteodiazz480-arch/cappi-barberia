import { z } from 'zod'

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(2, 'Ingresá tu nombre'),
  lastName: z.string().trim().min(2, 'Ingresá tu apellido'),
  phone: z
    .string()
    .trim()
    .min(8, 'Ingresá un teléfono válido')
    .regex(/^[0-9+\s()-]+$/, 'Ingresá solo números y símbolos válidos'),
  notes: z.string().trim().max(300, 'Máximo 300 caracteres').optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
