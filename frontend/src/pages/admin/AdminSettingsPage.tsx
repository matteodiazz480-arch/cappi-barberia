import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBusinessSettings, updateBusinessSettings } from '@/services/settings.service'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BusinessHoursEditor } from '@/components/admin/BusinessHoursEditor'
import { useToast } from '@/context/ToastContext'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminSettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['business-settings'],
    queryFn: getBusinessSettings,
  })
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    business_name: '',
    description: '',
    logo_url: '',
    whatsapp: '',
    phone: '',
    email: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    address: '',
  })

  useEffect(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name ?? '',
        description: settings.description ?? '',
        logo_url: settings.logo_url ?? '',
        whatsapp: settings.whatsapp ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        instagram_url: settings.instagram_url ?? '',
        tiktok_url: settings.tiktok_url ?? '',
        youtube_url: settings.youtube_url ?? '',
        address: settings.address ?? '',
      })
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: () => {
      if (!settings) throw new Error('No settings')
      return updateBusinessSettings(settings.id, form)
    },
    onSuccess: () => {
      showToast('Configuración guardada.', 'success')
      queryClient.invalidateQueries({ queryKey: ['business-settings'] })
    },
    onError: () => showToast('No se pudo guardar la configuración.', 'error'),
  })

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Configuración</h1>
        <p className="text-sm text-ink-500">Datos generales de tu barbería.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="space-y-4 p-5 lg:p-6">
          <h2 className="text-sm font-semibold text-ink-800">Información general</h2>
          <Input label="Nombre de la barbería" value={form.business_name} onChange={setField('business_name')} />
          <Textarea label="Descripción" value={form.description} onChange={setField('description')} />
          <Input label="URL del logo" value={form.logo_url} onChange={setField('logo_url')} placeholder="https://…" />
          <Input label="Dirección" value={form.address} onChange={setField('address')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Teléfono (texto visible)"
              value={form.phone}
              onChange={setField('phone')}
              placeholder="+54 9 380 415-2182"
            />
            <Input
              label="WhatsApp (solo números, con código de país)"
              value={form.whatsapp}
              onChange={setField('whatsapp')}
              placeholder="5493804152182"
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            placeholder="contacto@tubarberia.com"
          />
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-5 lg:p-6">
            <h2 className="text-sm font-semibold text-ink-800">Redes sociales</h2>
            <Input label="Instagram" value={form.instagram_url} onChange={setField('instagram_url')} />
            <Input label="TikTok" value={form.tiktok_url} onChange={setField('tiktok_url')} />
            <Input label="YouTube" value={form.youtube_url} onChange={setField('youtube_url')} />
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Horarios de atención</h2>
            <BusinessHoursEditor />
          </div>
        </div>
      </div>

      <Button size="lg" onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
        Guardar cambios
      </Button>
    </div>
  )
}
