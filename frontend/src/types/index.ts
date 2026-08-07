export * from './database'

export interface TimeSlot {
  time: string // 'HH:mm'
  available: boolean
}

export interface BookingFormData {
  firstName: string
  lastName: string
  phone: string
  serviceId: string
  date: string // 'yyyy-MM-dd'
  time: string // 'HH:mm'
  notes?: string
}

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  duration: string
  url: string
}
