import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, Scissors, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'
import logo from '@/assets/logo.png'

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays, end: false },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, end: false },
  { to: '/admin/servicios', label: 'Servicios', icon: Scissors, end: false },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings, end: false },
]

export function AdminSidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <img src={logo} alt="Cappi Barbería" className="h-6 w-auto object-contain" />
        <p className="mt-1 text-xs font-medium text-ink-400">Panel admin</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900',
                isActive && 'bg-ink-900 text-white hover:bg-ink-900 hover:text-white'
              )
            }
          >
            <Icon className="size-5" strokeWidth={1.9} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="size-5" strokeWidth={1.9} />
        Cerrar sesión
      </button>
    </aside>
  )
}
