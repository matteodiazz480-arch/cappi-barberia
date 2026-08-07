import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Revisá tu archivo .env.local'
  )
}

// Nota: el cliente no usa el generic <Database> de supabase-js porque nuestras
// tablas incluyen RPCs de escritura (create_appointment, etc.) cuyo tipado
// estricto de Functions/Views agrega complejidad sin beneficio real acá.
// Los tipos de dominio en `@/types` se aplican con casts explícitos en la
// capa de servicios (`src/services/*.ts`), que es el único lugar que llama a Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
