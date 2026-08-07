// Valores por defecto del negocio. Se usan como fallback en toda la app
// mientras `business_settings` no esté disponible (o no se haya configurado
// Supabase todavía), y como semilla conceptual de lo que hay en la base.
// Si se edita algo acá, conviene reflejarlo también en `supabase/schema.sql`.

export const BUSINESS_DEFAULTS = {
  name: 'Cappi Barbería',
  description: 'Cortes clásicos, modernos y personalizados en un ambiente relajado.',
  phone: '+54 9 380 415-2182',
  whatsapp: '5493804152182',
  email: 'cappilr5@gmail.com',
  address: 'Dirección a confirmar',
  instagramUrl: 'https://www.instagram.com/cappi_______/',
  tiktokUrl: 'https://www.tiktok.com/@cappi_______/',
  youtubeUrl: 'https://www.youtube.com/@CappiYutu',
  // Horarios de ejemplo (0 = domingo ... 6 = sábado). Editables desde el
  // panel admin una vez conectado Supabase; esto es solo el fallback visual
  // mientras tanto, para que la página no se vea incompleta.
  hours: [
    { weekday: 0, isOpen: false, open: null, close: null },
    { weekday: 1, isOpen: true, open: '09:00', close: '19:00' },
    { weekday: 2, isOpen: true, open: '09:00', close: '19:00' },
    { weekday: 3, isOpen: true, open: '09:00', close: '19:00' },
    { weekday: 4, isOpen: true, open: '09:00', close: '19:00' },
    { weekday: 5, isOpen: true, open: '09:00', close: '20:00' },
    { weekday: 6, isOpen: true, open: '09:00', close: '14:00' },
  ],
} as const
