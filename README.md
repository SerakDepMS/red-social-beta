
---

## ✨ Funcionalidades Principales

### 🔐 Autenticación
- Pantalla de login con **animación cinematográfica de intro** (zoom + fade)
- Registro e inicio de sesión con validación de credenciales
- Sesión persistente con `localStorage`

### 🌠 Fondo Espacial Interactivo (Three.js)
- **Agujero negro animado** con disco de acreción y efecto Doppler de colores
- **Campo de estrellas** con 11.500+ partículas en movimiento
- **Nebulosas** y parallax de cámara suave
- Escena de planeta con geometría personalizada y campo de escombros orbitales

### 📰 Feed Social
- Publicación de posts con texto, imágenes, vídeos y audio (hasta 50MB)
- **Paginación infinita** con Intersection Observer (10 posts por página)
- Ordenación por *reciente* o *relevancia*
- Reacciones con emojis, comentarios anidados y menciones `@usuario`
- **GIFs y stickers** integrados (colección local de GIPHY y OpenClipart)
- Encuestas interactivas y posts en grupos
- **Traducción automática** de posts a español vía LibreTranslate
- **Posts en formato Hilo** (varios mensajes encadenados)
- **Página Explorar** con hashtags de tendencia, posts populares y personas sugeridas
- **Nube de palabras** del feed (top 40 palabras más usadas)

### 💬 Mensajería Directa (Chat)
- Mensajes directos entre usuarios
- **Mensajes que se autodestruyen** tras 30 segundos
- **Reacciones con emojis** en cada mensaje DM
- **Responder a un mensaje específico** (reply encadenado)
- **Estado "escribiendo..."** animado en tiempo real
- **Encuestas dentro del chat privado**
- **Notas de voz** grabadas con Web Audio API / MediaRecorder
- Búsqueda en conversaciones

### 📖 Stories y Reels
- Creación de stories con imagen, vídeo o texto
- Visor de stories con barra de progreso y temporizador
- Reels de vídeo corto con reproductor estilo TikTok
- **Música de fondo** en reels (opcional)

### 👥 Grupos Avanzados
- Chat de grupo en tiempo real (sala de texto compartida)
- **Roles personalizados** dentro del grupo (Mod, VIP, Staff, Legend)
- **Anuncios fijados** con pin en la parte superior del grupo
- **Modo "Solo admins pueden postear"** (canal de noticias)
- **Invitación por enlace con código único**
- **Posts colaborativos** donde todos los miembros pueden añadir contribuciones

### 🎮 Gamificación
- **Misiones diarias** con recompensas de XP
- **Tienda de recompensas** canjeables por puntos acumulados
- **Insignias temporales** por eventos especiales (Navidad, Halloween, etc.)
- **Leaderboard all-time** además del semanal
- **Notificación de "¡Subiste de nivel!"** con animación
- **Marco de avatar** desbloqueado por nivel (verde, azul, púrpura, dorado, diamante)

### 🎨 Personalización de Perfil
- **Marco de avatar animado** según nivel
- **Banner de perfil con efecto parallax** al hacer scroll
- **Bio con links clickeables** y emojis renderizados
- **Tema de color por usuario** (10 colores disponibles: verde, azul, púrpura, rosa, naranja, cian, amarillo, rojo, teal, ámbar)
- **Widget de música** en el perfil (canción favorita con portada y URL)
- **Avatar 3D personalizable** (estilo Roblox) con Three.js

### 📊 Analytics & Admin
- **Panel admin con gráficas** de crecimiento de usuarios (posts por día)
- **Mapa de actividad global** (posts por hora del día)
- **Nube de palabras** más usadas en posts
- **Historial de accesos por IP/dispositivo** (registro de inicios de sesión)
- **Exportar datos propios en JSON** (GDPR‑style)

### 🛒 Marketplace
- Publicación y compraventa de productos entre usuarios
- Valoraciones y reseñas de vendedores con puntuación de estrellas
- Filtros por categoría, precio y disponibilidad
- Insignia especial para vendedores destacados y Diamante

### 📅 Eventos
- Creación de eventos con fecha, descripción y asistentes
- Recordatorios con notificación automática (toast)
- Eventos recurrentes (diario, semanal, mensual)

### 🔔 Notificaciones
- **Push toasts** en tiempo real para likes, comentarios, menciones, follows, insignias y cumpleaños
- Panel de notificaciones con contador de no leídas
- **Modo No Molestar (DND)** con badge visual en avatar
- Sonido de notificación vía Web Audio API

### 📊 Estadísticas & Gráficos (por usuario)
- Dashboard con métricas personalizadas (Chart.js)
- Gráfico de actividad semanal de publicaciones
- Registro de actividad global (`activityLog`)

### 🎨 Apariencia y Preferencias
- **Tema oscuro / claro** con toggle y persistencia
- **10 esquemas de color** seleccionables
- **Fondo de pantalla personalizable** (imagen, GIF o video) con control de opacidad
- **Modo lectura** con tipografía serif
- **Modo compacto** para feed más denso
- Sidebar fijable o colapsable
- Ajuste de tamaño de texto (14px, 15px, 17px)

### ⌨️ Atajos de Teclado
- `Ctrl+K` — Búsqueda global
- `Ctrl+N` — Panel de notificaciones
- `Ctrl+P` — Nuevo post
- `Alt+D` — Modo oscuro
- `G` luego `F` — Ir al feed
- `G` luego `M` — Ir a mensajes
- `?` — Modal de atajos disponibles
- `Esc` — Cerrar modal

### 🛡️ Moderación
- Sistema de reportes de contenido
- Panel de administración (roles privilegiados)
- Suspensión temporal de usuarios (1, 7 o 30 días)
- Log de actividad global visible para admins

### 📱 Responsive
- Sidebar colapsable y menú hamburguesa en móvil
- Drawer lateral derecho para configuración rápida en pantallas pequeñas
- Tipografía y layouts fluidos con `clamp()` y `flexbox`

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 / CSS3 / JS Vanilla | Base completa del proyecto |
| [Three.js r128](https://threejs.org/) | Animaciones 3D del fondo espacial y avatar 3D |
| [Chart.js 4.4](https://www.chartjs.org/) | Gráficos de estadísticas |
| [QRCode.js](https://davidshimjs.github.io/qrcodejs/) | Generación de QR de perfil |
| [Font Awesome 6.5](https://fontawesome.com/) | Iconografía |
| [Google Fonts](https://fonts.google.com/) | Tipografías (Orbitron, Inter, Plus Jakarta Sans, DM Sans) |
| Web Audio API | Sonidos de notificación y grabación de notas de voz |
| MediaRecorder API | Grabación de notas de voz |
| localStorage | Persistencia de sesión, datos y preferencias |
| Intersection Observer API | Feed con scroll infinito |
| LibreTranslate API | Traducción automática de posts |

---

## 📝 Notas

- Todos los datos son locales (guardados en el `localStorage` del navegador). No hay backend ni base de datos externa.
- La demo está en constante evolución. Las funcionalidades pueden mejorar entre versiones.
- Para una mejor experiencia, usa navegadores actualizados (Chrome, Edge, Firefox, Safari).

---

*Hecho con pasión por el equipo Serakdep MS*