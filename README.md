# Pauline Studio — Sistema de Turnos Online

Sistema completo de reservas online para **Paula Spinelli Cosmiatra**, desarrollado con Next.js 14, Prisma y Tailwind CSS.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + React 18 |
| Estilos | Tailwind CSS + Google Fonts |
| Backend | Next.js API Routes (serverless) |
| Base de datos | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Autenticación admin | JWT con cookies httpOnly |
| Validación | Zod |
| Hosting recomendado | Vercel + Vercel Postgres |

---

## Estructura del proyecto

```
pauline-studio/
├── prisma/
│   ├── schema.prisma       # Modelos de BD
│   └── seed.ts             # Datos iniciales
├── public/
│   └── images/             # Imágenes del negocio
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── reservar/page.tsx           # Formulario de reserva
│   │   ├── mis-turnos/page.tsx         # Consulta de turnos por email
│   │   ├── admin/
│   │   │   ├── login/page.tsx          # Login admin
│   │   │   └── dashboard/
│   │   │       ├── page.tsx            # Dashboard principal
│   │   │       ├── turnos/page.tsx     # Gestión de turnos
│   │   │       ├── servicios/page.tsx  # Gestión de servicios
│   │   │       └── horarios/page.tsx   # Gestión de horarios
│   │   └── api/
│   │       ├── auth/login/             # POST login
│   │       ├── auth/logout/            # POST logout
│   │       ├── bookings/               # CRUD turnos
│   │       ├── services/               # CRUD servicios
│   │       ├── availability/           # GET horarios disponibles
│   │       ├── my-bookings/            # GET turnos por email
│   │       ├── schedules/              # CRUD horarios semanales
│   │       └── blocked-dates/          # CRUD fechas bloqueadas
│   ├── components/
│   │   ├── ui/             # Navbar, Footer, Logo
│   │   ├── home/           # Hero, About, Services, etc.
│   │   ├── booking/        # Calendario, slots, formulario
│   │   └── admin/          # Sidebar, tablas admin
│   ├── lib/
│   │   ├── db.ts           # Prisma client singleton
│   │   ├── auth.ts         # JWT helpers
│   │   ├── validations.ts  # Schemas Zod
│   │   └── availability.ts # Lógica de disponibilidad
│   ├── middleware.ts        # Protección rutas admin
│   └── types/index.ts      # TypeScript interfaces
```

---

## Instalación local

### Requisitos previos
- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Entrar al directorio
cd pauline-studio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# El archivo .env.local ya está creado con valores por defecto para desarrollo.
# Revisá y modificá según necesites:
# - ADMIN_EMAIL y ADMIN_PASSWORD: credenciales del panel admin
# - JWT_SECRET: clave secreta para tokens (cambiala en producción)

# 4. Crear la base de datos y aplicar el schema
npm run db:push

# 5. Poblar con datos iniciales (servicios y horarios)
npm run db:seed

# 6. Iniciar el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

### Credenciales admin por defecto
- **URL:** http://localhost:3000/admin/login
- **Email:** admin@paulinestudio.com
- **Contraseña:** admin123

> ⚠️ Cambiá estas credenciales antes de hacer deploy.

---

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión a la BD | ✅ |
| `ADMIN_EMAIL` | Email del administrador | ✅ |
| `ADMIN_PASSWORD` | Contraseña del administrador | ✅ |
| `JWT_SECRET` | Clave secreta para JWT (mín. 32 chars) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL pública del sitio | Opcional |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp (sin +) | Opcional |

---

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run db:push      # Sincronizar schema con la BD (sin migraciones)
npm run db:migrate   # Crear nueva migración
npm run db:seed      # Poblar BD con datos iniciales
npm run db:studio    # Abrir Prisma Studio (interfaz visual de BD)
npm run db:generate  # Regenerar Prisma Client
```

---

## Deploy en Vercel

### 1. Crear base de datos PostgreSQL en Vercel

1. Ir a [vercel.com](https://vercel.com) → tu proyecto → **Storage**
2. Crear una **Postgres** database
3. Copiar la `DATABASE_URL` que genera Vercel

### 2. Cambiar el provider en `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"   # ← cambiar de "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Configurar variables de entorno en Vercel

En el panel de Vercel → **Settings** → **Environment Variables**, agregar:

```
DATABASE_URL         = (la URL de Vercel Postgres)
ADMIN_EMAIL          = tu_email@dominio.com
ADMIN_PASSWORD       = tu_contraseña_segura
JWT_SECRET           = (clave aleatoria de 32+ caracteres)
NEXT_PUBLIC_APP_URL  = https://tu-dominio.vercel.app
```

### 4. Deploy

```bash
# Instalar Vercel CLI (si no lo tenés)
npm i -g vercel

# Deploy
vercel

# O simplemente conectar el repositorio en vercel.com
```

### 5. Inicializar la BD en producción

Después del primer deploy, ejecutar desde la terminal local apuntando a la BD de producción:

```bash
# Con la DATABASE_URL de producción:
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## Funcionalidades

### Sitio público
- **Homepage:** presentación del negocio, servicios, galería de trabajos, testimonios y contacto
- **Reservar turno:** formulario en 3 pasos con selector de servicio, calendario interactivo y selección de horario
- **Mis turnos:** consulta de reservas por email

### Panel admin (`/admin/dashboard`)
- **Dashboard:** resumen con estadísticas y agenda del día
- **Turnos:** listado con filtros, confirmar/rechazar con nota opcional
- **Servicios:** crear, editar, activar/desactivar servicios
- **Horarios:** configurar días y horarios de atención, bloquear fechas

### Sistema de disponibilidad
- Genera slots de 30 minutos dentro del horario configurado
- Excluye turnos ya reservados (pendientes y confirmados)
- Bloquea fechas especiales
- Impide reservar en el pasado
- Permite reservar hasta 3 meses hacia adelante

---

## Personalización

### Cambiar información del negocio
Los datos del negocio están en estos archivos:
- `src/components/ui/Footer.tsx` — dirección, WhatsApp, Instagram
- `src/components/home/ContactSection.tsx` — información de contacto
- `src/components/home/Hero.tsx` — texto principal
- `src/app/layout.tsx` — metadata SEO

### Modificar la paleta de colores
Editar `tailwind.config.ts`:
```ts
colors: {
  teal: { 400: "#6BBFB5", ... },  // Color principal de la marca
  cream: { 100: "#FAF9F7", ... }, // Fondo
  blush: { 200: "#F8E4E0", ... }, // Acento rosa
}
```

### Cambiar la contraseña admin
Modificar `ADMIN_PASSWORD` en `.env.local` (local) o en Vercel (producción). No requiere reiniciar la base de datos.

---

## Seguridad

- Las rutas `/admin/*` (excepto login) están protegidas por middleware JWT
- El token se almacena en una cookie `httpOnly`, inaccesible desde JavaScript
- Las contraseñas de admin se validan contra variables de entorno (sin almacenamiento en BD)
- Validación con Zod en frontend y backend
- Rate limiting: no implementado (recomendado agregar antes de producción con `@upstash/ratelimit`)

---

## Licencia

© 2025 Pauline Studio · Paula Spinelli — Uso privado
