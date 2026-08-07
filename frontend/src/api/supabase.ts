import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // No lanzamos acá: un throw a nivel de módulo tira abajo toda la app antes
  // de que React llegue a renderizar nada (pantalla en blanco sin contexto
  // para el usuario). En vez de eso, `App.tsx` chequea `isSupabaseConfigured`
  // y muestra una pantalla clara si falta configuración.
  console.error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'En local: revisá frontend/.env.local. En Vercel: Project Settings → Environment Variables.'
  )
}

// Nota: el cliente no usa el generic <Database> de supabase-js porque nuestras
// tablas incluyen RPCs de escritura (create_appointment, etc.) cuyo tipado
// estricto de Functions/Views agrega complejidad sin beneficio real acá.
// Los tipos de dominio en `@/types` se aplican con casts explícitos en la
// capa de servicios (`src/services/*.ts`), que es el único lugar que llama a Supabase.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
