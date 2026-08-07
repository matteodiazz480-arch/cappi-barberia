import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, CalendarDays, Users, Scissors, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays, end: false },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/admin/servicios', label: 'Servicios', icon: Scissors, end: false },
  { to: '/admin/configuracion', label: 'Ajustes', icon: Settings, end: false },
]

export function AdminMobileNav() {
  return (
    <nav
      className="glass safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-ink-100 md:hidden"
      aria-label="Navegación del panel"
    >
      <ul className="flex items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className="relative flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium text-ink-400"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-active"
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-ink-900"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className={cn('size-6', isActive && 'scale-110')} strokeWidth={isActive ? 2.25 : 1.75} />
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
