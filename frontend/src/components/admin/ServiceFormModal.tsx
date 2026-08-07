import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Service } from '@/types'

export interface ServiceFormValues {
  name: string
  description: string
  price: number
  duration_minutes: number
  image_url: string
  is_active: boolean
}

interface ServiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ServiceFormValues) => void
  isSaving: boolean
  service?: Service | null
}

export function ServiceFormModal({ isOpen, onClose, onSubmit, isSaving, service }: ServiceFormModalProps) {
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [price, setPrice] = useState(String(service?.price ?? ''))
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? '30'))
  const [imageUrl, setImageUrl] = useState(service?.image_url ?? '')
  const [isActive, setIsActive] = useState(service?.is_active ?? true)

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      price: Number(price) || 0,
      duration_minutes: Number(duration) || 30,
      image_url: imageUrl,
      is_active: isActive,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Editar servicio' : 'Nuevo servicio'}>
      <div className="space-y-4">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Corte clásico" />
        <Textarea
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describí brevemente el servicio"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Precio" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input
            label="Duración (min)"
            type="number"
            min="5"
            step="5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <Input
          label="URL de imagen"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />

        <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-ink-300 text-ink-900 focus:ring-accent-400"
          />
          Servicio activo (visible para clientes)
        </label>

        <Button className="w-full" size="lg" onClick={handleSubmit} isLoading={isSaving}>
          Guardar servicio
        </Button>
      </div>
    </Modal>
  )
}
