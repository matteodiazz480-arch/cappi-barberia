# Cappi Barbería

Web app de reservas para una barbería: sitio público con reserva de turnos en tiempo real, y panel de administrador para gestionar agenda, clientes, servicios y configuración.

## ⚠️ Antes de nada: conectar Supabase

**Todo lo que "no funciona" hoy (el botón Reservar turno, el login del panel admin) es porque el proyecto todavía apunta a credenciales de Supabase de ejemplo (`placeholder.supabase.co`).** El código está completo, revisado y probado con capturas reales — solo falta el paso 1 de abajo, que se hace desde el navegador (no puede automatizarse desde acá) y toma 2-3 minutos.

**Esto sigue siendo 100% desarrollo local.** Crear un proyecto en Supabase no es "subir a producción": tu app (frontend + backend) va a seguir corriendo únicamente en tu computadora, en `localhost`. Supabase solo actúa como la base de datos — es el mismo motor Postgres que usarías instalado localmente, pero ya viene con autenticación y tiempo real listos para usar, sin tener que instalar y configurar Postgres/Auth/Realtime a mano. Es la forma estándar de desarrollar con este stack, incluso en proyectos que nunca se despliegan.

Una vez que completes el paso 1, **todo el resto empieza a funcionar solo**: los 3 servicios de ejemplo, el usuario administrador, los horarios, la reserva de turnos.

## Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, React Router, React Hook Form + Zod, TanStack Query, Lucide React. PWA instalable (vite-plugin-pwa).
- **Backend**: Node.js + Express (últimos videos de YouTube vía feed RSS público, sin API key).
- **Base de datos / Auth**: Supabase (Postgres + RLS + Realtime + Supabase Auth).

## Estructura

```
Barberia/
├── frontend/     # App React (público + panel admin)
├── backend/      # API Express (feed de YouTube)
└── supabase/
    └── schema.sql  # Esquema completo: tablas, RLS, funciones RPC, datos de ejemplo
```

El repo raíz tiene un `package.json` con **npm workspaces** que engloba `frontend` y `backend`, así que podés correr todo desde `Barberia/` directamente:

```bash
npm install           # instala frontend + backend
npm run dev            # levanta el frontend (http://localhost:5173)
npm run dev:backend    # levanta el backend (http://localhost:4000)
npm run build           # build de producción del frontend
```

---

## 1. Configurar Supabase (obligatorio)

1. Creá un proyecto gratis en [supabase.com](https://supabase.com) (con GitHub o email).
2. Abrí el **SQL Editor** del proyecto y pegá/ejecutá el contenido completo de [`supabase/schema.sql`](supabase/schema.sql) de una sola vez. Esto crea:
   - Las tablas, los índices, las políticas RLS y las funciones RPC de reserva.
   - El **usuario administrador por defecto** (ver credenciales abajo).
   - **3 servicios de ejemplo** con imagen, precio y duración.
   - Los datos de contacto y redes ya cargados.
3. Si algo del bloque de creación del usuario admin falla (el script avisa con un `NOTICE`, no rompe el resto), creálo a mano: **Authentication → Add User**, con el mismo email/contraseña de abajo, y después corré manualmente:
   ```sql
   insert into public.admin_users (user_id, full_name, role)
   values ('<uuid-del-usuario-que-creaste>', 'Santiago Castro', 'admin');
   ```
4. Confirmá que **Realtime** esté habilitado para `appointments` (Database → Replication) — el script lo activa solo, pero conviene verificarlo.
5. Ejecutá también [`supabase/client_accounts.sql`](supabase/client_accounts.sql) (aditivo, no borra nada) — crea el sistema de cuentas de cliente (login con teléfono + contraseña, sin email). Sin este paso, `/cuenta/registro` y `/cuenta/login` no van a funcionar.
6. Copiá la **Project URL** y la **anon public key** (Settings → API → Project API keys).

### Usuario administrador por defecto

```
URL:      /admin/login
Email:    admin@cappibarberia.com
Password: Cappi2026!
```

Cambiala después de tu primer ingreso (Supabase Dashboard → Authentication → Users → el usuario → "Reset password" o "Send password recovery").

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Completá `.env.local` con los datos del paso 1.5:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:4000
```

```bash
npm run dev       # desarrollo (http://localhost:5173)
npm run build     # build de producción
npm run lint      # lint (oxlint)
```

### Logo, banner e imágenes de servicios

- El logo (`logo.png`, fondo transparente) vive en `frontend/src/assets/logo.png` y se usa en el header, el splash screen, el footer y el panel admin.
- El banner del hero vive en `frontend/src/assets/banner.jpg`.
- Las imágenes de los 3 servicios de ejemplo viven en `frontend/public/images/services/` — para reemplazarlas alcanza con pisar esos archivos (mismo nombre) o cambiar la URL desde el panel admin (Servicios → Editar), sin tocar código.

Si reemplazás el logo, regenerá los íconos de PWA/favicon:

```bash
cd frontend
node scripts/generate-icons.mjs
```

## 3. Backend (últimos videos de YouTube) — solo desarrollo local

En producción (Vercel) esto lo resuelve automáticamente la función serverless `frontend/api/youtube/latest.ts` — no hace falta desplegar `backend/` por separado. `backend/` solo se usa en desarrollo local, con el proxy de Vite (`/api` → `http://localhost:4000`, ver `frontend/vite.config.ts`).

Es opcional: sin él, la sección "Últimos videos" simplemente queda vacía con su estado vacío correspondiente. No requiere API key — usa el feed RSS público del canal.

```bash
cd backend
npm install
cp .env.example .env
```

`.env` ya viene con el canal correcto por defecto:

```
PORT=4000
CORS_ORIGIN=http://localhost:5173
YOUTUBE_CHANNEL_ID=@CappiYutu
```

```bash
npm run dev     # desarrollo, en paralelo al frontend
```

## Desplegar en Vercel

Un solo proyecto de Vercel alcanza — no uses el preset de "multiple services" (es para monorepos con varios servidores corriendo todo el tiempo; acá el "backend" es una sola función serverless).

1. Importá el repo en Vercel.
2. **Root Directory**: `frontend` (Vercel detecta Vite automáticamente, sin configuración extra).
3. **Environment Variables** (Settings → Environment Variables):
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   YOUTUBE_CHANNEL_ID=@CappiYutu
   ```
4. Deploy. `frontend/api/youtube/latest.ts` se publica solo como Edge Function en `/api/youtube/latest` — no requiere `vercel.json`.

## Panel de administrador

Accedé en `/admin/login` con las credenciales de arriba. El panel incluye:

- **Dashboard**: turnos de hoy/mes, clientes, ingresos del día, gráfico semanal.
- **Agenda**: turnos por día, confirmar/cancelar/editar/reprogramar/eliminar, bloqueo de horarios y vacaciones.
- **Clientes**: búsqueda instantánea, historial de visitas.
- **Servicios**: alta, edición, activar/desactivar, precio, duración, imagen.
- **Configuración**: datos generales (incluye teléfono y email), redes sociales, horarios semanales de atención.

Las notificaciones de nuevos turnos llegan en tiempo real vía Supabase Realtime, sin recargar la página.

En **Agenda**, además de la lista de turnos, hay una grilla con todos los horarios del día (según los horarios semanales configurados) marcando cada uno como disponible / reservado / bloqueado — se puede bloquear un horario libre o desbloquear uno bloqueado tocándolo directamente.

## Cuentas de cliente

Sistema de login propio para clientes — **teléfono + contraseña, sin email**, independiente de Supabase Auth (que es email/OTP-céntrico). Ver `supabase/client_accounts.sql`.

- `/cuenta/registro` y `/cuenta/login`: alta e ingreso.
- `/cuenta`: turnos próximos, historial, cancelar (solo con más de 24hs de anticipación), editar perfil, cambiar contraseña, cerrar sesión.
- Si un cliente reserva un turno (o ya lo había hecho antes de registrarse) usando el **mismo teléfono** de su cuenta, el turno se asocia automáticamente — no hace falta "vincular" nada a mano.
- Cada acción valida un token de sesión propio (tabla `client_sessions`) del lado del servidor antes de tocar cualquier dato; un cliente nunca puede ver ni cancelar turnos de otro.

## Splash screen

Al entrar a la app se muestra una pantalla de carga con el logo (animación flotante suave) y un spinner con "Cargando…", que se desvanece hacia la página principal. Se controla en `frontend/src/App.tsx` (`MIN_SPLASH_DURATION_MS`) y el componente vive en `frontend/src/components/SplashScreen.tsx`.

## Datos de contacto / redes por defecto

Viven centralizados en `frontend/src/config/business.ts` (se usan como fallback si `business_settings` todavía no cargó) y en el seed de `supabase/schema.sql`:

- Teléfono: +54 9 380 415-2182
- Email: cappilr5@gmail.com
- Instagram: instagram.com/cappi_______
- TikTok: tiktok.com/@cappi_______
- YouTube: youtube.com/@CappiYutu

Para cambiarlos permanentemente, editá esos dos archivos o hacelo desde el panel admin (Configuración), que persiste en `business_settings`.

## Seguridad

Los clientes anónimos nunca leen ni escriben directamente las tablas `clients` ni `appointments`. Toda reserva pública pasa por la función `create_appointment` (Postgres `security definer`), que valida disponibilidad server-side y evita condiciones de carrera. La disponibilidad se consulta vía `get_booked_slots` / `get_blocked_ranges`, que no exponen datos de clientes.
