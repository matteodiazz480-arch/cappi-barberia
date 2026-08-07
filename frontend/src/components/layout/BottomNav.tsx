import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Scissors, CalendarCheck, PlaySquare, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useClientAuth } from '@/context/ClientAuthContext'

export function BottomNav() {
  const { isAuthenticated } = useClientAuth()

  const items = [
    { to: '/', label: 'Inicio', icon: Home, end: true },
    { to: '/servicios', label: 'Servicios', icon: Scissors, end: false },
    { to: '/reservar', label: 'Reservar', icon: CalendarCheck, end: false },
    { to: '/videos', label: 'Videos', icon: PlaySquare, end: false },
    { to: isAuthenticated ? '/cuenta' : '/cuenta/login', label: 'Mi cuenta', icon: User, end: false },
  ]

  return (
    <nav
      className="glass safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-ink-100 lg:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className="relative flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium text-ink-400 transition-colors data-[active=true]:text-ink-900"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-ink-900"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon
                    className={cn('size-6 transition-transform', isActive && 'scale-110')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className={cn(isActive && 'text-ink-900')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
