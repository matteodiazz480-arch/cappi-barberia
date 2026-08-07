import { motion } from 'framer-motion'
import logo from '@/assets/logo.png'

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{
        opacity: 0,
        filter: 'blur(16px)',
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-ink-50 px-6"
    >
      <motion.img
        src={logo}
        alt="Cappi Barbería"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -18, 0],
        }}
        transition={{
          opacity: { duration: 0.6, ease: 'easeOut' },
          scale: { duration: 0.6, ease: 'easeOut' },
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
        }}
        className="h-24 w-auto max-w-[80vw] object-contain sm:h-32 lg:h-40"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-16 flex flex-col items-center gap-3.5"
      >
        <span className="size-7 animate-spin rounded-full border-[2.5px] border-ink-200 border-t-ink-900" />
        <p className="text-sm font-medium tracking-wide text-ink-400">Cargando…</p>
      </motion.div>
    </motion.div>
  )
}
