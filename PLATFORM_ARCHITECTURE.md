# 📚 Experiencia Miguel - Arquitectura de la Plataforma

## Resumen Ejecutivo

**Experiencia Miguel** es una plataforma de comunidad digital centrada en contenido educativo de oratoria, organizada en torno al concepto de "libro digital" con capítulos independientes. La plataforma implementa un sistema multi-tenant basado en "Casas" que permite aislar comunidades por dominio.

---

## 🏗️ Arquitectura de Datos

### Modelo Multi-Tenant: Sistema de "Casas"

La plataforma utiliza un modelo **multi-tenant** donde cada instancia de la aplicación es una "Casa" única identificada por su dominio:

```
experienciamiguel.com → Casa A (ID: uuid-1)
otrositio.com → Casa B (ID: uuid-2)
```

**Características clave:**
- ✅ Aislamiento total de datos por dominio
- ✅ Cada casa tiene sus propios usuarios, libros y contenido
- ✅ Inicialización automática al primer acceso
- ✅ Almacenamiento local del `casa_id` en el navegador

---

## 📊 Esquema de Base de Datos

### 1️⃣ Tabla: `casas`

**Propósito:** Registro central de cada instancia/comunidad de la plataforma

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único de la casa |
| `created_at` | Timestamp | Fecha de creación |
| `casa_nombre` | Text (UNIQUE) | Nombre del dominio (ej: "experienciamiguel.com") |
| `casa_memo` | JSONB | Metadatos configurables (JSON flexible) |

**Índices:**
- `casa_nombre` (UNIQUE) - Búsqueda rápida por dominio

**RLS (Row Level Security):**
- ✅ SELECT: Público (cualquiera puede ver casas)
- ✅ INSERT: Solo usuarios autenticados

**Relaciones:**
- → `profiles.casa_id` (1:N - Una casa tiene muchos perfiles)
- → `libro.casa_id` (1:N - Una casa tiene muchos libros)

---

### 2️⃣ Tabla: `profiles`

**Propósito:** Perfiles de usuario extendidos vinculados a Supabase Auth

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK, FK) | ID del usuario de Supabase Auth |
| `email` | Text | Email del usuario |
| `full_name` | Text | Nombre completo |
| `avatar_url` | Text | URL del avatar |
| `created_at` | Timestamp | Fecha de registro |
| `updated_at` | Timestamp | Última actualización |
| `casa_id` | UUID (FK) | Casa a la que pertenece |

**Foreign Keys:**
- `id` → `auth.users.id` (CASCADE DELETE)
- `casa_id` → `casas.id` (CASCADE DELETE)

**Índices:**
- `casa_id` - Búsquedas por casa

**RLS (Row Level Security):**
- ✅ SELECT: Usuarios de la misma casa
- ✅ INSERT: Solo el propio usuario en su casa
- ✅ UPDATE: Solo el propio perfil
- ❌ DELETE: No permitido (se maneja vía CASCADE)

---

### 3️⃣ Tabla: `libro`

**Propósito:** Almacenamiento de capítulos/contenido educativo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único del capítulo |
| `user_id` | UUID (FK) | Autor/creador del contenido |
| `casa_id` | UUID (FK) | Casa a la que pertenece |
| `titulo` | Text (NOT NULL) | Título del capítulo |
| `descripcion` | Text | Descripción breve/sinopsis |
| `contenido` | Text (NOT NULL) | Contenido completo (Markdown) |
| `autor` | Text | Nombre del autor visible |
| `portada_url` | Text | URL de imagen de portada |
| `audio_https` | Text | URL HTTPS al audio principal |
| `audioanalisis_https` | Text | URL HTTPS al audio de análisis |
| `categoria` | Text | Categoría del contenido |
| `orden` | Integer (DEFAULT 0) | Orden de visualización |
| `visible` | Boolean (DEFAULT true) | Visibilidad pública |
| `created_at` | Timestamp | Fecha de creación |
| `updated_at` | Timestamp | Última modificación |

**Foreign Keys:**
- `user_id` → `auth.users.id` (CASCADE DELETE)
- `casa_id` → `casas.id` (CASCADE DELETE)

**Índices:**
- `casa_id` - Búsquedas por casa
- `user_id` - Búsquedas por autor
- `orden` - Ordenamiento eficiente

**RLS (Row Level Security):**
- ✅ SELECT: Contenido visible dentro de la misma casa
- ✅ INSERT: Usuarios autenticados en su casa
- ✅ UPDATE: Solo el autor del contenido
- ✅ DELETE: Solo el autor del contenido

---

## 🔄 Flujos de Datos

### Flujo de Autenticación e Inicialización

```
1. Usuario visita experienciamiguel.com
   ↓
2. Sistema detecta hostname → "experienciamiguel.com"
   ↓
3. Busca/Crea casa con ese nombre en DB
   ↓
4. Guarda casa_id en localStorage del navegador
   ↓
5. Usuario se autentica (Supabase Auth)
   ↓
6. Se crea/actualiza perfil vinculado a casa_id
   ↓
7. Usuario accede al dashboard de SU casa
```

**Código relevante:**
- `src/services/casaService.ts::initializeCasa()`
- `src/services/authService.ts`

---

### Flujo de Gestión de Contenido (CRUD Libros)

#### CREATE - Crear Capítulo
```
1. Admin va a /settings
   ↓
2. Click "Nuevo Capítulo"
   ↓
3. Llena formulario (título, descripción, contenido, audio URLs)
   ↓
4. Submit → createLibro(data, user_id)
   ↓
5. INSERT en tabla `libro` con casa_id automático
   ↓
6. RLS valida: user_id == auth.uid() && casa_id match
   ↓
7. Capítulo creado y visible en biblioteca
```

#### READ - Leer Capítulos
```
1. Usuario autenticado va a /biblioteca
   ↓
2. getAllLibros() consulta todos los capítulos
   ↓
3. SELECT * FROM libro WHERE casa_id = current_casa_id AND visible = true
   ↓
4. RLS filtra automáticamente por casa
   ↓
5. Se muestran en grid de tarjetas
   ↓
6. Click en tarjeta → Vista de lectura completa
```

#### UPDATE - Actualizar Capítulo
```
1. Admin en /settings → Click "Editar" en capítulo
   ↓
2. Formulario pre-cargado con datos existentes
   ↓
3. Modifica campos necesarios
   ↓
4. Submit → updateLibro(libro_id, data)
   ↓
5. UPDATE libro SET ... WHERE id = libro_id AND casa_id = current_casa_id
   ↓
6. RLS valida: user_id == auth.uid()
   ↓
7. Cambios reflejados en biblioteca
```

#### DELETE - Eliminar Capítulo
```
1. Admin en /settings → Click "Eliminar"
   ↓
2. AlertDialog de confirmación
   ↓
3. Confirmación → deleteLibroContent(libro_id)
   ↓
4. DELETE FROM libro WHERE id = libro_id AND casa_id = current_casa_id
   ↓
5. RLS valida: user_id == auth.uid()
   ↓
6. Capítulo eliminado permanentemente
```

**Código relevante:**
- `src/services/libroService.ts` - Todas las operaciones CRUD
- `src/pages/settings.tsx` - UI de administración
- `src/pages/biblioteca.tsx` - UI de lectura

---

## 🎯 Funcionalidades Principales

### 1. Dashboard (`/dashboard`)
**Rol:** Hub central de navegación

**Características:**
- ✅ Tarjeta de bienvenida personalizada
- ✅ Acceso rápido a Biblioteca Digital (activo)
- ✅ Placeholders para funcionalidades futuras:
  - Comunidad (foro/chat)
  - Ejercicios (prácticas de oratoria)
  - Mentorías (sesiones 1-on-1)
- ✅ Información de cuenta del usuario
- ✅ Botón flotante de Configuración (bottom-right)

**Usuarios objetivo:** Todos los miembros autenticados

---

### 2. Biblioteca Digital (`/biblioteca`)
**Rol:** Consumo de contenido educativo

**Modos de Vista:**

#### A) Grid View (Vista de Galería)
- Lista de todos los capítulos disponibles
- Tarjetas con:
  - Portada (imagen o placeholder)
  - Título
  - Autor
  - Descripción breve
  - Indicador de audio disponible
- Click → Cambia a Reader View

#### B) Reader View (Vista de Lectura)
- Título y autor destacados
- Imagen de portada grande
- Descripción completa
- **Reproductores de audio HTML5:**
  - Audio principal (`audio_https`)
  - Audio de análisis (`audioanalisis_https`)
- Contenido formateado con Markdown básico:
  - Headers (#, ##, ###)
  - Negritas (**texto**)
  - Cursivas (*texto*)
  - Links ([texto](url))
  - Párrafos con saltos de línea
- Botón "Volver a la Biblioteca"

**Usuarios objetivo:** Todos los miembros autenticados

---

### 3. Configuración (`/settings`)
**Rol:** Panel de administración de contenido

**Modos de Operación:**

#### A) List Mode (Vista de Lista)
- Grid de tarjetas de todos los capítulos
- Acciones por capítulo:
  - Editar (abre formulario)
  - Eliminar (con confirmación)
- Botón "Nuevo Capítulo"
- Empty state si no hay libros

#### B) Create Mode (Crear)
Formulario completo:
- ✅ Título* (requerido)
- ✅ Autor
- ✅ Descripción breve (textarea)
- ✅ Contenido completo (textarea grande, Markdown)
- ✅ URL de portada
- ✅ URL audio principal (HTTPS)
- ✅ URL audio análisis (HTTPS)

#### C) Edit Mode (Editar)
- Mismo formulario pre-llenado
- Botón "Guardar Cambios"
- Opción de eliminar

**Validaciones:**
- Título obligatorio
- URLs validadas (type="url")
- Feedback visual de éxito/error
- Confirmación antes de eliminar

**Usuarios objetivo:** Solo administradores/creadores de contenido

---

## 🔐 Seguridad y Permisos

### Row Level Security (RLS)

#### Nivel 1: Aislamiento por Casa
```sql
-- Todos los SELECTs filtran automáticamente por casa_id
SELECT * FROM libro WHERE casa_id = current_casa_id
```
- ✅ Usuarios de experienciamiguel.com NO ven contenido de otrositio.com
- ✅ Implementado a nivel de base de datos (no bypasseable)

#### Nivel 2: Propiedad de Contenido
```sql
-- Solo el autor puede modificar/eliminar
UPDATE/DELETE FROM libro 
WHERE user_id = auth.uid() AND id = libro_id
```
- ✅ Usuarios solo pueden editar SU propio contenido
- ✅ Validación automática por RLS

#### Nivel 3: Autenticación
```typescript
// Rutas protegidas verifican sesión
const { data: { session } } = await supabase.auth.getSession();
if (!session) router.push("/auth");
```
- ✅ Páginas protegidas redirigen a /auth si no hay sesión
- ✅ Implementado en: `/dashboard`, `/biblioteca`, `/settings`

---

## 🎨 Experiencia de Usuario

### Diseño Visual
- **Paleta:** Tonos cálidos (amber, orange, stone)
- **Gradientes:** `from-amber-50 via-orange-50 to-amber-100`
- **Tipografía:**
  - Headers: Font-serif (elegante)
  - Body: Sans-serif (legible)
  - Code/Content: Mono (contenido técnico)
- **Componentes:** shadcn/ui con personalización amber

### Navegación
```
Landing (/) → Auth (/auth) → Dashboard (/dashboard)
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              Biblioteca      Configuración    Logout
              (/biblioteca)    (/settings)      → (/)
```

### Responsive Design
- ✅ Mobile-first
- ✅ Breakpoints: sm, md, lg
- ✅ Touch-friendly (buttons, cards)
- ✅ Sticky headers en móvil

---

## 📁 Organización del Código

### Estructura de Servicios

```
src/services/
├── authService.ts       # Autenticación Supabase
│   ├── signUp()
│   ├── signIn()
│   ├── signOut()
│   ├── getCurrentUser()
│   └── getRedirectURL()
│
├── casaService.ts       # Gestión multi-tenant
│   ├── getCurrentSiteName()
│   ├── initializeCasa()
│   ├── getCasaId()
│   ├── setCasaId()
│   └── getCurrentCasa()
│
└── libroService.ts      # CRUD de contenido
    ├── getAllLibros()
    ├── getLibroById()
    ├── createLibro()
    ├── updateLibro()
    └── deleteLibroContent()
```

### Componentes UI (shadcn/ui)

```
src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── textarea.tsx
├── alert-dialog.tsx
└── ... (50+ componentes)
```

### Páginas

```
src/pages/
├── index.tsx           # Landing page pública
├── auth.tsx            # Login/Registro
├── dashboard.tsx       # Hub principal
├── biblioteca.tsx      # Lectura de contenido
└── settings.tsx        # Admin de contenido
```

---

## 🚀 Flujo de Datos Completo (Ejemplo Real)

### Escenario: Usuario Lee un Capítulo

```
1. Usuario autenticado → navega a /biblioteca
   localStorage: { casa_id: "uuid-experienciamiguel" }
   
2. useEffect ejecuta:
   const { data: libros } = await getAllLibros()
   
3. Servicio consulta:
   SELECT * FROM libro 
   WHERE casa_id = 'uuid-experienciamiguel' 
     AND visible = true
   ORDER BY created_at DESC
   
4. RLS valida automáticamente casa_id
   
5. Resultados: [
     {
       id: "libro-1",
       titulo: "Capítulo 1: Introducción",
       autor: "Miguel",
       descripcion: "Los fundamentos de la oratoria",
       contenido: "# Bienvenido\n\nEste es el contenido...",
       portada_url: "https://cdn.ejemplo.com/portada1.jpg",
       audio_https: "https://streaming.ejemplo.com/cap1.mp3",
       audioanalisis_https: "https://streaming.ejemplo.com/cap1-analisis.mp3"
     },
     ...
   ]
   
6. UI renderiza grid de tarjetas
   
7. Usuario click en tarjeta → setSelectedLibro(libro-1)
   
8. Vista cambia a Reader Mode
   
9. Renderiza:
   - <h1>Capítulo 1: Introducción</h1>
   - <img src="portada_url" />
   - <audio src="audio_https" controls />
   - <audio src="audioanalisis_https" controls />
   - <div dangerouslySetInnerHTML={formatMarkdownContent(contenido)} />
   
10. Usuario lee, escucha audio, disfruta contenido
```

---

## 📊 Métricas y Escalabilidad

### Rendimiento Actual
- **Queries:** Indexadas por `casa_id`, `user_id`, `orden`
- **RLS:** Filtrado a nivel de PostgreSQL (óptimo)
- **Assets:** URLs externas (no almacenamiento local)

### Capacidad Teórica
- **Casas:** Ilimitadas (multi-tenant)
- **Usuarios por casa:** Ilimitados
- **Capítulos por casa:** Ilimitados
- **Tamaño de contenido:** Sin límite (Text field)

### Optimizaciones Implementadas
- ✅ Índices en foreign keys
- ✅ Cascade deletes (integridad referencial)
- ✅ RLS para seguridad + rendimiento
- ✅ localStorage para cache de casa_id
- ✅ Timestamps automáticos (created_at, updated_at)

---

## 🔮 Funcionalidades Futuras (Roadmap)

### En el Dashboard (Placeholders)

1. **Comunidad**
   - Foro/chat entre miembros
   - Tabla: `messages`, `threads`
   
2. **Ejercicios**
   - Prácticas de oratoria guiadas
   - Tabla: `ejercicios`, `user_submissions`
   
3. **Mentorías**
   - Sesiones 1-on-1 con mentor
   - Tabla: `mentoria_sessions`, `bookings`

### Mejoras Técnicas
- [ ] Sistema de comentarios en capítulos
- [ ] Progreso de lectura por usuario
- [ ] Búsqueda full-text en contenido
- [ ] Categorías/tags para organización
- [ ] Editor WYSIWYG para Markdown
- [ ] Upload de audio directo a Supabase Storage

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15.2 (Page Router)
- **UI:** React 18.3 + TypeScript
- **Styling:** Tailwind CSS v3.4
- **Componentes:** shadcn/ui
- **Iconos:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** URLs externas (futuro: Supabase Storage)
- **RLS:** Políticas de seguridad a nivel de DB

### Infraestructura
- **Hosting:** Vercel (sugerido)
- **Domain:** Multi-tenant por hostname
- **CDN:** Para assets estáticos

---

## 📝 Convenciones y Mejores Prácticas

### Nomenclatura
- **Tablas:** Singular, lowercase (`libro` no `libros`)
- **Columnas:** snake_case (`casa_id`, `audio_https`)
- **Componentes:** PascalCase (`LibroCard`, `DashboardPage`)
- **Servicios:** camelCase (`getAllLibros`, `initializeCasa`)

### Gestión de Estado
- **Local:** useState para UI efímero
- **Context:** CasaContext para casa_id global
- **Server:** Supabase como fuente de verdad

### Manejo de Errores
```typescript
const { data, error } = await supabaseCall();
if (error) {
  console.error("Error:", error);
  return { data: null, error: error as Error };
}
return { data, error: null };
```

---

## 🎓 Conclusión

**Experiencia Miguel** es una plataforma educativa robusta con:

✅ **Arquitectura multi-tenant** escalable por dominio  
✅ **CRUD completo** de contenido educativo  
✅ **Seguridad a nivel de base de datos** con RLS  
✅ **UX intuitiva** para lectura y administración  
✅ **Stack moderno** (Next.js + Supabase + TypeScript)  
✅ **Fundación sólida** para crecimiento futuro  

La plataforma está lista para escalar a múltiples comunidades independientes, cada una con su propio contenido, usuarios y configuración, manteniendo aislamiento total de datos y experiencia personalizada.