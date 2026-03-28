# Spots (Rincones)

App chilena para descubrir y compartir lugares. Los usuarios publican "spots" con fotos, ubicacion GPS, categoria, dificultad y region/comuna. Otros usuarios pueden guardar, valorar y comentar.

## Stack tecnico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Framework | Expo (managed workflow) | SDK 54 |
| Router | expo-router (file-based) | 6.0 |
| Lenguaje | TypeScript (strict mode) | 5.5 |
| Backend | Supabase (auth, DB, storage) | JS client 2.99 |
| State | Zustand | 5.0 |
| Mapas | react-native-maps | 1.20 |
| Imagenes | expo-image | 3.0 |
| Animaciones | react-native-reanimated | 4.1 |
| Fechas | date-fns | 4.1 |
| React / RN | React 19.1 / RN 0.81 | - |

**Supabase Project ID:** `khunsinhemytvjzwrzxh` | **Region:** `sa-east-1`

## Comandos

```bash
npx expo start              # dev server (Expo Go o dev client)
npx expo start --ios        # abrir en simulador iOS
npx expo start --android    # abrir en emulador Android
eas build --profile development  # build de desarrollo (necesario para mapas)
eas build --profile preview      # build interno de prueba
eas build --profile production   # build de produccion
```

## Estructura de carpetas

```
rincones/
  app/
    _layout.tsx             # Root layout (Stack). Auth listener, redireccion por session
    index.tsx               # Splash/bootstrap: verifica session, onboarding, redirige
    onboarding.tsx          # Pantalla de bienvenida (una vez)
    editar-perfil.tsx       # Modal para editar perfil del usuario
    (auth)/
      _layout.tsx           # Stack sin header para auth
      login.tsx
      register.tsx
      recuperar.tsx         # Recuperar contrasena (envio de email)
      nueva-contrasena.tsx  # Reset de contrasena (deep link PASSWORD_RECOVERY)
      verificar.tsx         # Verificacion de email
    (tabs)/
      _layout.tsx           # Tab navigator con blur, 5 tabs
      index.tsx             # Feed principal (masonry grid 2 columnas, filtros, busqueda)
      explorar.tsx          # Mapa interactivo + lista de spots con GPS
      subir.tsx             # Formulario para crear un nuevo spot
      guardados.tsx         # Spots guardados por el usuario
      perfil.tsx            # Perfil del usuario actual + sus spots
    lugar/[id].tsx          # Detalle de un spot (card presentation)
    perfil/[id].tsx         # Perfil de otro usuario (card presentation)
    editar-lugar/[id].tsx   # Editar un spot propio (modal)
  components/
    PostCard.tsx            # Tarjeta de spot para el grid (imagen + titulo + rating)
    Avatar.tsx              # Componente de avatar con fallback a inicial
    CommentsSection.tsx     # Lista de comentarios + input para agregar
    ImageCarousel.tsx       # Carrusel horizontal con paginacion y dots
    ZoomableImage.tsx       # Modal de imagen a pantalla completa con zoom
    SkeletonCard.tsx        # Skeleton loading para el feed
    DifficultyBar.tsx       # Barra visual de dificultad (4 niveles)
    StarRating.tsx          # Estrellas para valorar + promedio
  hooks/
    usePost.ts              # Fetch de un post individual con profile, guardado y rating del usuario
    useProfile.ts           # Fetch de perfil + posts de un usuario
    useComments.ts          # CRUD de comentarios de un post
    useRegiones.ts          # Fetch de las 16 regiones de Chile
    useComunas.ts           # Fetch de comunas filtradas por region
    useUploadImage.ts       # Pick, compress y upload de imagenes (single, multiple, avatar)
    useRating.ts            # Upsert de rating con recalculo de promedio
  stores/
    authStore.ts            # Session, user, profile. Login/logout via Supabase Auth
    postsStore.ts           # Lista de posts con paginacion, filtros, busqueda, sort, toggleSave
  constants/
    index.ts                # Tema (light/dark via useColorScheme), categorias, dificultades, POSTS_PER_PAGE
  lib/
    supabase.ts             # Cliente Supabase (anon key, AsyncStorage para persistencia)
  types/
    index.ts                # Interfaces: Post, Profile, Region, Comuna, Guardado, CategoriaTipo
```

## Base de datos (Supabase - todas las tablas con RLS activo)

### posts
Tabla principal. Cada fila es un spot publicado.
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid | PK, auto-generado |
| user_id | uuid | FK -> profiles.id |
| titulo | text | obligatorio |
| descripcion | text | nullable |
| imagen_url | text | URL de la imagen principal |
| lat | float8 | nullable, coordenada GPS |
| lng | float8 | nullable, coordenada GPS |
| region_id | int4 | FK -> regiones.id, nullable |
| comuna_id | int4 | FK -> comunas.id, nullable |
| categoria | enum categoria_tipo | naturaleza, playa, ciudad, sendero, pueblo, lago, montana |
| dificultad | int4 | 1-4 (check constraint) |
| rating_avg | numeric | promedio de estrellas (actualizado por trigger) |
| rating_count | int4 | cantidad de valoraciones |
| likes_count | int4 | default 0 |
| comments_count | int4 | default 0 |
| created_at | timestamptz | default now() |

### profiles
Creado automaticamente al registrarse (trigger en auth.users).
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid | PK, FK -> auth.users.id |
| username | text | unique |
| full_name | text | nullable |
| avatar_url | text | nullable |
| bio | text | nullable |
| region_id | int4 | nullable |
| created_at | timestamptz | |

### regiones
Las 16 regiones de Chile. Datos estaticos (16 filas).
| Columna | Tipo |
|---------|------|
| id | int4 (serial) PK |
| nombre | text |
| slug | text (unique) |
| orden | int4 |

### comunas
345 comunas de Chile, cada una asociada a una region.
| Columna | Tipo |
|---------|------|
| id | int4 (serial) PK |
| nombre | text |
| region_id | int4 FK -> regiones.id |

### post_images
Imagenes adicionales de un spot (hasta 5 por post).
| Columna | Tipo |
|---------|------|
| id | int4 (serial) PK |
| post_id | uuid FK -> posts.id |
| url | text |
| orden | int4 (default 0) |
| created_at | timestamptz |

### ratings
Valoracion de 1-5 estrellas. PK compuesta (user_id, post_id). Un trigger recalcula rating_avg y rating_count en posts.
| Columna | Tipo |
|---------|------|
| user_id | uuid FK -> auth.users.id |
| post_id | uuid FK -> posts.id |
| stars | int4 (check 1-5) |
| created_at | timestamptz |

### guardados
Spots guardados por el usuario. PK compuesta (user_id, post_id).
| Columna | Tipo |
|---------|------|
| user_id | uuid FK -> profiles.id |
| post_id | uuid FK -> posts.id |
| created_at | timestamptz |

### comments
Comentarios en spots. Maximo 300 caracteres (check constraint).
| Columna | Tipo |
|---------|------|
| id | uuid PK |
| post_id | uuid FK -> posts.id |
| user_id | uuid FK -> profiles.id |
| texto | text (max 300) |
| created_at | timestamptz |

### likes
PK compuesta (user_id, post_id). Existe en la DB pero no se usa activamente en la UI actual.
| Columna | Tipo |
|---------|------|
| user_id | uuid FK -> profiles.id |
| post_id | uuid FK -> posts.id |
| created_at | timestamptz |

## Storage

- **Bucket:** `lugares`
- **Imagenes de posts:** `{user_id}/{timestamp}.jpg` (resize a 1200px ancho, compress 0.8)
- **Avatares:** `avatars/{user_id}.jpg` (resize a 400px, compress 0.85, upsert true)

## Convenciones de codigo

### Patron de pantallas
Cada pantalla sigue este patron:
1. `useColors()` para obtener el tema (light/dark)
2. `useMemo(() => getStyles(COLORS), [COLORS])` para estilos reactivos al tema
3. `getStyles(C: Colors) => StyleSheet.create({...})` como funcion fuera del componente
4. `SafeAreaView` con `edges={['top']}` como contenedor raiz

### Patron de hooks
- Cada hook encapsula un fetch a Supabase con estado `loading`
- Retornan `{ data, loading, refetch }` o variantes similares
- Manejan errores con `console.error` y estados fallback

### Estado global (Zustand)
- `useAuthStore`: session, user, profile, signOut
- `usePostsStore`: lista de posts con paginacion (POSTS_PER_PAGE = 12), filtros multiples (region, comuna, categoria, dificultad), busqueda con debounce, sort (recent/popular), toggleSave con optimistic update

### Navegacion
- Solo usar `expo-router`: `router.push()`, `router.replace()`, `router.back()`, `useLocalSearchParams()`
- Nunca importar de `@react-navigation/native`
- Typed routes habilitadas en app.json

### Temas
- Dark mode nativo via `useColorScheme()` de React Native
- Colores primarios: verde `#1c4a30` (light) / `#3d8b5e` (dark)
- Acento: amarillo `#e8c547`
- Funcion `useColors()` exportada desde `constants/index.ts`

### Path aliases
- `@/*` mapeado a la raiz del proyecto via tsconfig paths

### Imagenes
- Siempre usar `expo-image` (Image de `expo-image`), no el Image de React Native
- Excepciones: previews locales antes de upload (subir.tsx usa Image de RN para URIs locales)

### FlatList
- Siempre incluir `keyExtractor`, `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, `initialNumToRender`
- Masonry simulado con `numColumns={2}` y alturas alternadas segun index

## Arquitectura y decisiones importantes

1. **Managed workflow unicamente.** No usar `expo eject` ni bare workflow. Si se necesita un modulo nativo, usar development builds con EAS.

2. **react-native-maps requiere development build.** En Expo Go se muestra un fallback con mensaje. El codigo usa deteccion de runtime: `Constants.executionEnvironment === 'storeClient'` para cargar maps condicionalmente con `require()`.

3. **Triggers en Supabase.** `rating_avg` y `rating_count` en `posts` se recalculan automaticamente via trigger cuando se inserta/actualiza un registro en `ratings`. No calcular estos valores en el cliente.

4. **Optimistic updates.** `toggleSave` y el rating aplican el cambio en UI inmediatamente y revierten si el server falla.

5. **Idioma de la app:** Espanol (Chile). Nombres de tablas, columnas y UI en espanol. Las fechas usan `date-fns` con locale `es`.

6. **Paginacion:** Offset-based con `.range()`. `POSTS_PER_PAGE = 12`. El store maneja `page` y `hasMore`.

7. **Filtros combinables:** Region + comuna + categoria + dificultad + busqueda de texto (ilike). Se aplican todos al mismo tiempo. `setMultipleFilters` permite cambiar varios sin hacer fetch intermedio.

8. **Imagenes multiples:** Un post tiene una `imagen_url` principal en la tabla `posts` y opcionalmente mas imagenes en `post_images` (orden 0 = principal). Al crear, se sube la principal primero y luego las extras.

9. **Auth flow:** email/password via Supabase Auth. Email confirmation requerida. Password recovery via deep link (scheme `spots://`). Onboarding se muestra una sola vez (flag en AsyncStorage).

## Restricciones

- No usar Firebase, Amplify ni alternativas a Supabase
- No sugerir expo eject
- No inventar tablas o columnas que no existan en el schema
- No usar `any` en TypeScript (usar tipado estricto o `unknown` con type guards)
- RLS esta activo en todas las tablas; nunca sugerir desactivarlo ni usar service_role en el cliente
- El tab bar usa BlurView con posicion absoluta; dar paddingBottom de ~100 al contenido de cada tab
