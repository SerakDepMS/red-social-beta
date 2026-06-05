# 🌌 Serakdep MS — Red Social Beta

> **Demo en vivo:** [https://serakdepms.github.io/red-social-beta/](https://serakdepms.github.io/red-social-beta/)

Una red social completa, inmersiva y de código abierto construida enteramente con HTML, CSS y JavaScript vanilla. Diseñada con una estética espacial única y funcionalidades modernas comparables a las grandes plataformas.

---

## 📁 Estructura del Proyecto

```
red-social-beta/
├── index.html        # Pantalla de inicio de sesión / registro (con animación cinematográfica)
├── dashboard.html    # App principal — feed, perfil, chat, grupos, marketplace...
├── style.css         # Estilos globales, temas, modo oscuro/claro, colores personalizables
├── script.js         # Lógica central: estado global, usuarios, posts, navegación, modales
└── features.js       # Pack de funcionalidades avanzadas v2.0
```

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
- **GIFs y stickers** integrados (Giphy + colección local de OpenClipart)
- Encuestas interactivas y posts en grupos

### 💬 Chat en Tiempo Real (simulado)
- Mensajes directos entre usuarios
- **Notas de voz** grabadas con Web Audio API / MediaRecorder
- Mensajes efímeros (se autodestruyen)
- Indicadores de estado en línea y tiempo de última actividad
- Búsqueda en conversaciones

### 📖 Stories y Reels
- Creación de stories con imagen/texto
- **Música de fondo** por URL de audio en stories
- Visor de stories con barra de progreso y temporizador
- Reels de vídeo corto con reproductor integrado

### 👤 Perfiles de Usuario
- Avatar personalizable (subida de imagen o generado por canvas)
- Niveles y puntos de experiencia (XP)
- **Sistema de insignias** desbloqueables (primera publicación, 100 likes, nivel 10/50, etc.)
- Estadísticas: seguidores, seguidos, posts, likes recibidos
- Perfil con bio, cumpleaños y visibilidad configurable
- **Código QR** de perfil generado automáticamente (QRCode.js)

### 👥 Grupos
- Creación y gestión de grupos públicos/privados
- Roles: Fundador, Líder, Soporte Técnico, Admin, Miembro
- Feed de grupo propio con posts y encuestas
- Sistema de invitaciones y solicitudes de unión

### 🛒 Marketplace
- Publicación y compraventa de productos entre usuarios
- Valoraciones y reseñas de vendedores con puntuación de estrellas
- Carrito de compra y historial de pedidos
- Insignia especial para vendedores destacados y Diamante

### 📅 Eventos
- Creación de eventos con fecha, descripción y asistentes
- Recordatorios con notificación automática (toast)
- Panel de próximos eventos en sidebar

### 🔔 Notificaciones
- **Push toasts** en tiempo real para likes, comentarios, menciones, follows, insignias y cumpleaños
- Panel de notificaciones con contador de no leídas
- **Modo No Molestar (DND)** con badge visual en avatar
- Sonido de notificación vía Web Audio API

### 📊 Estadísticas & Gráficos
- Dashboard con métricas del usuario (Chart.js)
- Gráfico de actividad semanal
- Registro de actividad global (`activityLog`)

### 🎨 Personalización
- **Tema oscuro / claro** con toggle y persistencia
- **5 esquemas de color** (verde, violeta, azul, naranja, rosa)
- Sidebar fijable o colapsable
- Preferencias guardadas en `localStorage`

### ⌨️ Atajos de Teclado
- `Ctrl+K` — Búsqueda global
- `Ctrl+N` — Panel de notificaciones
- `?` — Modal de atajos disponibles

### 🛡️ Moderación
- Sistema de reportes de contenido
- Panel de administración (roles privilegiados)
- Log de actividad global visible para admins

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 / CSS3 / JS Vanilla | Base completa del proyecto |
| [Three.js r128](https://threejs.org/) | Animaciones 3D del fondo espacial |
| [Chart.js 4.4](https://www.chartjs.org/) | Gráficos de estadísticas |
| [QRCode.js](https://davidshimjs.github.io/qrcodejs/) | Generación de QR de perfil |
| [Font Awesome 6.5](https://fontawesome.com/) | Iconografía |
| [Google Fonts](https://fonts.google.com/) | Tipografías (Orbitron, Inter, Plus Jakarta Sans, DM Sans) |
| Web Audio API | Sonidos de notificación |
| MediaRecorder API | Grabación de notas de voz |
| localStorage | Persistencia de sesión y preferencias |
| Intersection Observer API | Feed con scroll infinito |

---

## 🚀 Cómo Usar

No requiere instalación ni servidor. Simplemente:

1. Clona o descarga el repositorio
2. Abre `index.html` en cualquier navegador moderno
3. Regístrate con un nombre de usuario y contraseña
4. ¡Explora la red social!

O accede directamente a la demo en vivo: **[https://serakdepms.github.io/red-social-beta/](https://serakdepms.github.io/red-social-beta/)**

---

## 📱 Responsive

La interfaz está optimizada para escritorio y dispositivos móviles, con:
- Sidebar colapsable y menú hamburguesa en móvil
- Drawer lateral derecho para configuración rápida en pantallas pequeñas
- Tipografía y layouts fluidos con `clamp()` y `flexbox`

---

## 📝 Notas

- Todos los datos son locales (guardados en el `localStorage` del navegador). No hay backend ni base de datos externa.
- La beta está en constante desarrollo. Las funcionalidades pueden cambiar entre versiones.

---

*Hecho con pasion por el equipo Serakdep MS*