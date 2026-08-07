import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-ink-100', className)} />
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-ink-100 bg-white p-4 shadow-soft-sm">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex justify-between pt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}
