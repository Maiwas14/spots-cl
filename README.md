# Spots CL

Descubre y comparte los mejores spots de Chile. Una app móvil para explorar lugares increíbles organizados por región, categoría y popularidad.

## Stack

- **Expo SDK 54** + TypeScript + Expo Router
- **Supabase** — auth, base de datos, storage
- **Zustand** — estado global
- **expo-image** — carga y caché de imágenes optimizada
- **expo-blur** — tab bar con efecto glassmorphism
- **react-native-maps** — mapa interactivo
- **date-fns** — formato de fechas en español

## Estructura

```
spots-cl/
├── app/
│   ├── _layout.tsx           ← Root layout + auth listener
│   ├── index.tsx             ← Redirect inicial
│   ├── onboarding.tsx        ← 3 slides de bienvenida
│   ├── editar-perfil.tsx     ← Editar nombre, bio y avatar
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verificar.tsx     ← Verificación de email
│   ├── (tabs)/
│   │   ├── index.tsx         ← Feed con búsqueda y filtros
│   │   ├── explorar.tsx      ← Mapa interactivo
│   │   ├── subir.tsx         ← Subir hasta 5 fotos
│   │   ├── guardados.tsx     ← Spots guardados
│   │   └── perfil.tsx        ← Mi perfil
│   ├── lugar/[id].tsx        ← Detalle del spot
│   └── perfil/[id].tsx       ← Perfil público
├── components/
│   ├── Avatar.tsx            ← Avatar reutilizable
│   ├── CommentsSection.tsx   ← Comentarios con optimistic UI
│   ├── ImageCarousel.tsx     ← Carrusel paginado
│   ├── PostCard.tsx          ← Card del feed
│   ├── SkeletonCard.tsx      ← Skeleton loader animado
│   └── ZoomableImage.tsx     ← Zoom con pinch (modal)
├── hooks/
│   ├── useComments.ts
│   ├── useComunas.ts
│   ├── usePost.ts
│   ├── useProfile.ts
│   ├── useRegiones.ts
│   └── useUploadImage.ts
├── stores/
│   ├── authStore.ts
│   └── postsStore.ts
├── lib/supabase.ts
├── types/index.ts
└── constants/index.ts
```

## Instalación

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/Maiwas14/spots-cl.git
cd spots-cl
npm install

# 2. Correr
npx expo start
```

## Supabase

Base de datos conectada en São Paulo (sa-east-1):

| Tabla | Descripción |
|---|---|
| `profiles` | Usuarios con username, bio y avatar |
| `regiones` | 16 regiones de Chile |
| `comunas` | 346 comunas vinculadas a regiones |
| `posts` | Spots con imagen, coords, categoría |
| `post_images` | Imágenes adicionales por spot (hasta 5) |
| `likes` | Likes de usuarios a posts |
| `guardados` | Spots guardados por usuarios |
| `comments` | Comentarios con contador automático (trigger) |

Storage: bucket `lugares` (público) — imágenes de spots y avatares.

## Funcionalidades

- Feed con búsqueda por texto, filtro por región/comuna/categoría y ordenamiento por recientes o populares
- Subida múltiple de fotos (hasta 5) con galería en carrusel y zoom con pinch
- Mapa interactivo con marcadores por región
- Comentarios en posts con borrado propio
- Verificación de email antes de acceder
- Onboarding de 3 slides (se muestra solo la primera vez)
- Perfil editable: nombre, bio y foto de perfil
- Guardado de spots y likes con estado optimista
- Navegación a Google Maps desde el detalle del spot
- Compartir spot por mensaje

## Variables de entorno

Las keys están en `lib/supabase.ts`. Para producción muévelas a `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```
