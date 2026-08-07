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

const phoneSchema = z
  .string()
  .trim()
  .min(8, 'Ingresá un teléfono válido')
  .regex(/^[0-9+\s()-]+$/, 'Ingresá solo números y símbolos válidos')

const passwordSchema = z.string().min(6, 'Mínimo 6 caracteres')

export const clientRegisterSchema = z.object({
  firstName: z.string().trim().min(2, 'Ingresá tu nombre'),
  lastName: z.string().trim().min(2, 'Ingresá tu apellido'),
  phone: phoneSchema,
  password: passwordSchema,
})
export type ClientRegisterValues = z.infer<typeof clientRegisterSchema>

export const clientLoginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Ingresá tu contraseña'),
})
export type ClientLoginValues = z.infer<typeof clientLoginSchema>

export const clientProfileSchema = z.object({
  firstName: z.string().trim().min(2, 'Ingresá tu nombre'),
  lastName: z.string().trim().min(2, 'Ingresá tu apellido'),
})
export type ClientProfileValues = z.infer<typeof clientProfileSchema>

export const clientChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Repetí la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
export type ClientChangePasswordValues = z.infer<typeof clientChangePasswordSchema>
