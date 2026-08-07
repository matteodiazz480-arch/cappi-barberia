import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getBusinessSettings } from '@/services/settings.service'
import { InstagramIcon, YoutubeIcon, TikTokIcon } from '@/components/ui/BrandIcons'
import { BUSINESS_DEFAULTS } from '@/config/business'

export function SocialSection() {
  const { data: settings } = useQuery({
    queryKey: ['business-settings'],
    queryFn: getBusinessSettings,
    staleTime: 5 * 60 * 1000,
  })

  const socials = [
    {
      name: 'Instagram',
      handle: '@cappi_______',
      url: settings?.instagram_url || BUSINESS_DEFAULTS.instagramUrl,
      icon: InstagramIcon,
      gradient: 'from-fuchsia-500 via-rose-500 to-amber-400',
    },
    {
      name: 'TikTok',
      handle: '@cappi_______',
      url: settings?.tiktok_url || BUSINESS_DEFAULTS.tiktokUrl,
      icon: TikTokIcon,
      gradient: 'from-cyan-400 via-ink-900 to-rose-500',
    },
    {
      name: 'YouTube',
      handle: '@CappiYutu',
      url: settings?.youtube_url || BUSINESS_DEFAULTS.youtubeUrl,
      icon: YoutubeIcon,
      gradient: 'from-red-500 to-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {socials.map((social, i) => (
        <motion.a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-ink-100 bg-white p-4 shadow-soft-sm transition-shadow hover:shadow-soft-md"
        >
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${social.gradient}`}
          >
            <social.icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink-900">{social.name}</p>
            <p className="truncate text-sm text-ink-500">{social.handle}</p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-600" />
        </motion.a>
      ))}
    </div>
  )
}
