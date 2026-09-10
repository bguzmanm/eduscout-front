# EduScout — Frontend

Aplicación web para explorar y buscar ofertas académicas de trabajo en Chile.

## Stack

- **Runtime:** Bun
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Iconos:** lucide-react
- **Compiler:** React Compiler (babel-plugin-react-compiler)

## Requisitos previos

- [Bun](https://bun.sh/) >= 1.0
- Backend de EduScout corriendo en `http://localhost:3001`

## Setup

```bash
# 1. Instalar dependencias
bun install

# 2. Iniciar servidor de desarrollo
bun run dev
```

La aplicación arranca en `http://localhost:3000`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo (puerto 3000) |
| `bun run build` | Compilar para producción |
| `bun run start` | Iniciar en producción |
| `bun run lint` | Lint (ESLint) |

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL del backend |

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx           # Layout raíz (Navbar + Footer)
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Tailwind + paleta de colores
│   ├── ofertas/
│   │   ├── page.tsx         # Listado de ofertas con filtros
│   │   └── [id]/
│   │       └── page.tsx     # Detalle de una oferta
│   └── fuentes/
│       └── page.tsx         # Fuentes de scraping
├── components/
│   ├── Navbar.tsx           # Navegación fija superior
│   ├── Footer.tsx           # Pie de página
│   ├── JobCard.tsx          # Tarjeta de oferta laboral
│   ├── SearchBar.tsx        # Campo de búsqueda por texto
│   └── FiltersBar.tsx       # Filtros: fuente, región, tipo
└── lib/
    └── api.ts               # Cliente API (getJobs, getJob, getSources, getJobStats)
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing con estadísticas recientes y "Cómo funciona" |
| `/ofertas` | Listado paginado de ofertas con búsqueda y filtros |
| `/ofertas/[id]` | Detalle completo con botón de postulación |
| `/fuentes` | Lista de universidades e instituciones con estado |

## Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `azul` | `#1B365D` | Texto principal, títulos |
| `marino` | `#0F2440` | Hover de botones principales |
| `arena` | `#F5F0EB` | Fondo de página |
| `tiza` | `#E8E2DC` | Bordes y separadores |
| `dorado` | `#C4972A` | Acento, CTAs, highlights |
| `piedra` | `#6B7280` | Texto secundario |

## Componentes

- **Navbar** — Barra de navegación fija con logo y links. Responsive (mobile simplificado).
- **Footer** — Pie con links a plataforma y legal. Copyright 2026.
- **JobCard** — Tarjeta de oferta con título, empresa, ubicación, tipo, fecha límite y fuente. Link a detalle.
- **SearchBar** — Input de búsqueda por texto. Se envía como query param `q`.
- **FiltersBar** — Tres selects: fuente (desde API), región (10 regiones chilenas), tipo de jornada (4 opciones).

## Datos

Todos los datos provienen del backend vía Server Components. La aplicación degrada gracefully si el backend no está disponible (muestra estados vacíos sin errores).

**Filtros disponibles:**
- Búsqueda por título (`q`)
- Fuente (slug de la universidad/institución)
- Región (Metropolitana, Valparaíso, Biobío, Araucanía, Ñuble, O'Higgins, Maule, Los Lagos, Antofagasta, Coquimbo)
- Tipo de jornada (Jornada Completa, Part Time, Mixta, Teletrabajo)

**Paginación:** 20 resultados por página, controlada por URL search params.
