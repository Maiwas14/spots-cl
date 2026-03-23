# Mejoras Spots 🏔️

---

## 🔴 Alta prioridad (impacto directo en retención)

### Comentarios en posts
- Tabla `comments(id, post_id, user_id, texto, created_at)`
- Sección de comentarios en el detalle del lugar
- Contador de comentarios en la tarjeta

### Notificaciones push
- Push cuando alguien da like o comenta tu spot
- Usar `expo-notifications`
- Guardar `push_token` en tabla `profiles`

### Seguir usuarios
- Tabla `follows(follower_id, following_id)`
- Botón "Seguir" en perfil público
- Feed alternativo "Solo quienes sigo"

### Verificación de email al registrarse
- Actualmente Supabase lo envía pero no se bloquea el acceso
- Mostrar pantalla de "Confirma tu correo" antes de entrar al feed

---

## 🟡 Media prioridad (mejora la experiencia)

### Zoom en imágenes
- Pinch to zoom en el detalle del lugar
- Usar `react-native-reanimated` + gesture handler

### Editar/reportar un spot
- Botón "Editar" para el dueño del post (título, descripción, categoría)
- Botón "Reportar" para otros usuarios

### Búsqueda de usuarios
- En la barra de búsqueda del feed, alternar entre buscar lugares y buscar usuarios
- Resultados con avatar + username

### Caché offline
- Guardar últimos posts en AsyncStorage
- Mostrarlos mientras carga si no hay conexión

### Estadísticas del perfil
- Gráfico simple de likes recibidos por semana
- Post más popular destacado en el perfil

---

## 🟢 Baja prioridad (pulido final)

### Onboarding
- 3 pantallas al primer login explicando la app
- Guardar flag `onboarding_seen` en AsyncStorage

### Animación al dar like
- Corazón que crece y rebota con `react-native-reanimated`

### Modo oscuro
- Leer `useColorScheme()` y alternar paleta de colores

### Deep links
- Compartir un spot abre la app directamente en ese post
- Configurar scheme `spots://lugar/[id]`

### Ranking semanal
- Sección "Lo más visto esta semana" en el feed
- Query con filtro `created_at > now() - interval '7 days'` ordenado por `likes_count`

### Menciones en comentarios
- @usuario en comentarios notifica al mencionado
- Highlight del texto en azul/verde

---

## 🗄️ Base de datos pendiente

| Tabla | Descripción |
|-------|-------------|
| `comments` | Comentarios por post |
| `follows` | Relación seguidor/seguido |
| `notifications` | Historial de notificaciones |
| `reports` | Reportes de contenido |

---

## 🐛 Bugs conocidos

- Guardados no se actualizan en tiempo real si das unsave desde el detalle
- El carrusel de fotos en el detalle no muestra las imágenes extra si el post fue subido antes de la migración `post_images`
- En Android el tab bar transparente puede no verse bien (BlurView tiene soporte limitado)
