import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import { SocialSection } from '@/components/social/SocialSection'
import { LatestVideos } from '@/components/videos/LatestVideos'
import banner from '@/assets/banner.jpg'

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  return (
    <section
      ref={heroRef}
      className="relative h-[440px] w-full overflow-hidden shadow-soft-lg sm:h-[540px] lg:h-[750px]"
    >
      <motion.img
        src={banner}
        alt="Cappi Barbería"
        style={{ y }}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 h-[118%] w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-10">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl"
        >
          Hola capitán, bienvenido a mi barbería.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base lg:mt-7 lg:max-w-2xl lg:text-xl"
        >
          Estoy muy feliz de tenerte por aquí. Reservá tu turno de forma rápida y sencilla,
          eligiendo el día y la hora que mejor se adapten a vos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="mt-8 lg:mt-10">
            <Link
              to="/reservar"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-medium text-ink-900 shadow-soft-md transition-colors hover:bg-ink-50 lg:h-15 lg:px-10 lg:text-lg"
            >
              <CalendarCheck className="size-5" />
              Reservar turno
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div>
      <Hero />

      <section className="mx-auto mt-16 max-w-3xl px-5 lg:mt-28 lg:max-w-6xl lg:px-8">
        <div className="mb-4 flex items-center justify-between lg:mb-10">
          <h2 className="text-xl font-semibold tracking-tight text-ink-900 lg:text-3xl">
            Últimos videos
          </h2>
          <Link
            to="/videos"
            className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900 lg:text-base"
          >
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </div>
        <LatestVideos limit={3} />
      </section>

      <section className="mx-auto mt-16 max-w-3xl px-5 pb-16 lg:mt-28 lg:max-w-6xl lg:px-8 lg:pb-28">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink-900 lg:mb-10 lg:text-3xl">
          Seguime en redes
        </h2>
        <SocialSection />
      </section>
    </div>
  )
}
