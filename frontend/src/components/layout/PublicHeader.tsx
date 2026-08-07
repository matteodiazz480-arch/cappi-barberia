import { Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getBusinessSettings } from '@/services/settings.service'
import { cn } from '@/utils/cn'
import logo from '@/assets/logo.png'

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/servicios', label: 'Servicios', end: false },
  { to: '/videos', label: 'Videos', end: false },
]

export function PublicHeader() {
  const { data: settings } = useQuery({
    queryKey: ['business-settings'],
    queryFn: getBusinessSettings,
    staleTime: 5 * 60 * 1000,
  })

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'safe-top sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-ink-100 bg-white/75 shadow-soft-sm backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 lg:h-[88px] lg:px-8">
        <Link to="/" aria-label={settings?.business_name ?? 'Cappi Barbería'} className="shrink-0">
          <img
            src={settings?.logo_url || logo}
            alt={settings?.business_name ?? 'Cappi Barbería'}
            className="h-14 w-auto object-contain lg:h-[68px]"
          />
        </Link>

        <nav
          className="hidden items-center gap-2 lg:flex"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-full px-4 py-2.5 text-[15px] font-medium text-ink-500 transition-colors hover:text-ink-900',
                  isActive && 'text-ink-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="public-nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ink-900"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
