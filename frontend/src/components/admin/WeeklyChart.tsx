import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { addDays, subDays } from 'date-fns'
import { supabase } from '@/api/supabase'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { toDateInputValue } from '@/utils/format'

const dayLabel = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })

async function getLastSevenDaysCounts(): Promise<{ label: string; count: number }[]> {
  const today = new Date()
  const from = subDays(today, 6)
  const fromIso = new Date(from.getFullYear(), from.getMonth(), from.getDate()).toISOString()
  const toIso = addDays(today, 1).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select('starts_at')
    .gte('starts_at', fromIso)
    .lt('starts_at', toIso)
    .neq('status', 'cancelado')

  if (error) throw error

  const counts = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    counts.set(toDateInputValue(subDays(today, 6 - i)), 0)
  }

  for (const row of data ?? []) {
    const key = toDateInputValue(new Date(row.starts_at as unknown as string))
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([key, count]) => ({
    label: dayLabel.format(new Date(`${key}T00:00:00`)),
    count,
  }))
}

export function WeeklyChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'weekly-chart'],
    queryFn: getLastSevenDaysCounts,
  })

  const max = Math.max(1, ...(data?.map((d) => d.count) ?? [1]))

  return (
    <Card className="p-5">
      <h3 className="mb-5 text-sm font-semibold text-ink-800">Turnos de los últimos 7 días</h3>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="flex h-40 items-end justify-between gap-2">
          {data?.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / max) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full min-h-1 items-start justify-center rounded-t-lg bg-ink-900"
                style={{ height: `${(d.count / max) * 100}%` }}
              >
                {d.count > 0 && (
                  <span className="mt-[-20px] text-xs font-medium text-ink-700">{d.count}</span>
                )}
              </motion.div>
              <span className="text-[11px] capitalize text-ink-400">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
