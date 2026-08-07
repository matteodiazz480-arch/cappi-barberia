import { useQuery } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { getBusinessSettings } from '@/services/settings.service'
import { getBusinessHours } from '@/services/booking.service'
import { InstagramIcon, YoutubeIcon, TikTokIcon } from '@/components/ui/BrandIcons'
import { BUSINESS_DEFAULTS } from '@/config/business'
import logo from '@/assets/logo.png'

const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['business-settings'],
    queryFn: getBusinessSettings,
    staleTime: 5 * 60 * 1000,
  })
  const { data: hours } = useQuery({
    queryKey: ['business-hours'],
    queryFn: getBusinessHours,
    staleTime: 5 * 60 * 1000,
  })

  const year = new Date().getFullYear()

  const businessName = settings?.business_name ?? BUSINESS_DEFAULTS.name
  const whatsapp = settings?.whatsapp || BUSINESS_DEFAULTS.whatsapp
  const phone = settings?.phone || BUSINESS_DEFAULTS.phone
  const email = settings?.email || BUSINESS_DEFAULTS.email
  const address = settings?.address || BUSINESS_DEFAULTS.address
  const instagramUrl = settings?.instagram_url || BUSINESS_DEFAULTS.instagramUrl
  const tiktokUrl = settings?.tiktok_url || BUSINESS_DEFAULTS.tiktokUrl
  const youtubeUrl = settings?.youtube_url || BUSINESS_DEFAULTS.youtubeUrl

  const hoursList =
    hours && hours.length > 0
      ? hours.map((h) => ({
          weekday: h.weekday,
          isOpen: h.is_open,
          open: h.open_time?.slice(0, 5) ?? null,
          close: h.close_time?.slice(0, 5) ?? null,
        }))
      : BUSINESS_DEFAULTS.hours

  const socials = [
    { name: 'Instagram', url: instagramUrl, Icon: InstagramIcon, iconClassName: 'size-5' },
    { name: 'YouTube', url: youtubeUrl, Icon: YoutubeIcon, iconClassName: 'size-5' },
    { name: 'TikTok', url: tiktokUrl, Icon: TikTokIcon, iconClassName: 'size-4' },
  ]

  return (
    <footer className="mb-16 border-t border-ink-100 bg-white pb-10 pt-12 lg:mb-0 lg:pb-14 lg:pt-16">
      <div className="mx-auto max-w-3xl px-5 lg:max-w-6xl lg:px-8">
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-16">
          <div className="lg:max-w-xs">
            <img
              src={settings?.logo_url || logo}
              alt={businessName}
              className="h-7 w-auto object-contain"
            />

            {(settings?.description || BUSINESS_DEFAULTS.description) && (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
                {settings?.description || BUSINESS_DEFAULTS.description}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ name, url, Icon, iconClassName }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="flex size-10 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-colors hover:bg-ink-900 hover:text-white"
                >
                  <Icon className={iconClassName} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:mt-0 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <Clock className="size-4" /> Horarios
              </h3>
              <ul className="space-y-1 text-sm text-ink-500">
                {hoursList.map((h) => (
                  <li key={h.weekday} className="flex justify-between gap-4">
                    <span>{dayLabels[h.weekday]}</span>
                    <span>
                      {h.isOpen && h.open && h.close ? `${h.open} – ${h.close}` : 'Cerrado'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink-800">Contacto</h3>
              <ul className="space-y-2 text-sm text-ink-500">
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  <span>{address}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" />
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink-800"
                  >
                    {phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-ink-800">
                    {email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-ink-400 lg:mt-14">
          © {year} {businessName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
