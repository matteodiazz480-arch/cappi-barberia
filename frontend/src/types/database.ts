export type AppointmentStatus =
  | 'pendiente'
  | 'confirmado'
  | 'cancelado'
  | 'completado'
  | 'no_asistio'

export interface AdminUser {
  id: string
  user_id: string
  full_name: string
  role: 'admin' | 'super_admin'
  created_at: string
}

export interface Client {
  id: string
  first_name: string
  last_name: string
  phone: string
  notes: string | null
  created_at: string
}

export interface ClientWithStats extends Client {
  visits_count: number
  last_appointment: string | null
  next_appointment: string | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface BusinessHours {
  id: string
  weekday: number // 0 = domingo ... 6 = sábado
  is_open: boolean
  open_time: string | null // 'HH:mm:ss'
  close_time: string | null
  slot_interval_minutes: number
}

export interface BlockedSlot {
  id: string
  starts_at: string
  ends_at: string
  reason: string | null
  is_full_day: boolean
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string
  service_id: string
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentWithRelations extends Appointment {
  client: Client
  service: Service
}

export interface BusinessSettings {
  id: string
  business_name: string
  description: string | null
  logo_url: string | null
  whatsapp: string | null
  phone: string | null
  email: string | null
  instagram_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  address: string | null
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      admin_users: { Row: AdminUser; Insert: Partial<AdminUser>; Update: Partial<AdminUser> }
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> }
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> }
      business_hours: { Row: BusinessHours; Insert: Partial<BusinessHours>; Update: Partial<BusinessHours> }
      blocked_slots: { Row: BlockedSlot; Insert: Partial<BlockedSlot>; Update: Partial<BlockedSlot> }
      appointments: { Row: Appointment; Insert: Partial<Appointment>; Update: Partial<Appointment> }
      business_settings: { Row: BusinessSettings; Insert: Partial<BusinessSettings>; Update: Partial<BusinessSettings> }
    }
  }
}
