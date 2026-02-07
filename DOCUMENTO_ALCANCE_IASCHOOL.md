# 📚 IA SCHOOL - DOCUMENTO DE ALCANCE COMPLETO
## Plataforma de Gestión Escolar Inteligente

**Versión:** 3.0  
**Fecha:** 7 de Febrero 2026  
**Estado:** Producción  
**Última Actualización:** Fase 2 & 3 Completadas

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Cantidad |
|---------|----------|
| **Páginas/Vistas** | 56+ |
| **Endpoints API** | 140+ |
| **Modelos de Datos** | 75+ |
| **Roles de Usuario** | 6 |
| **Idiomas Soportados** | 6 |

### Nuevas Funcionalidades (v3.0)
- ✅ Módulo de Becas y Descuentos
- ✅ Gestión de Ciclos Escolares
- ✅ Multi-Tutor (custodia compartida)
- ✅ Programa de Referidos Escolar
- ✅ Autenticación Biométrica (WebAuthn)
- ✅ Rate Limiting y Seguridad Avanzada
- ✅ Sistema de Gamificación
- ✅ Tips y Consejos con IA

---

## 🎯 ARQUITECTURA TÉCNICA

### Stack Tecnológico
| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes |
| Base de Datos | PostgreSQL + Prisma ORM |
| Autenticación | NextAuth.js + WebAuthn |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado | React Query + Zustand |
| PWA | Service Worker + Push Notifications |
| Almacenamiento | AWS S3 |
| IA | Abacus AI APIs |

### Características PWA
- ✅ Instalable en iOS y Android
- ✅ Funciona offline (páginas cacheadas)
- ✅ Push Notifications
- ✅ Manifest.json configurado
- ✅ Service Worker activo

---

## 🎭 ROLES DEL SISTEMA

### 1. SUPER_ADMIN (Administrador Global)
**Descripción:** Control total multi-escuela para el dueño del SaaS.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard global | ✅ | `/super-admin` |
| Gestión de escuelas | ✅ | `/super-admin/schools` |
| Configuración global | ✅ | `/super-admin/config` |
| Logs de auditoría | ✅ | `/super-admin/audit` |
| Ver detalle de escuela | ✅ | `/super-admin/schools/[id]` |
| Métricas de uso global | ✅ | API disponible |
| Reportes consolidados | ⚠️ | En desarrollo |
| Facturación SaaS | ⚠️ | En desarrollo |

---

### 2. ADMIN (Administrador de Escuela)
**Descripción:** Control total de una escuela específica.

#### Módulos Core
| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard administrativo | ✅ | `/dashboard` |
| Dashboard ejecutivo | ✅ | `/dashboard/executive` |
| Gestión de usuarios | ✅ | `/directory` |
| Invitaciones (con QR) | ✅ | `/invitations` |
| Importación masiva CSV | ✅ | `/import` |

#### Comunicación
| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Anuncios (crear/editar) | ✅ | `/announcements/new` |
| Mensajería | ✅ | `/messages` |
| CRM/Mailing | ✅ | `/crm` |
| Encuestas NPS | ✅ | `/surveys` |
| Votaciones | ✅ | `/polls` |
| Análisis de sentimiento | ✅ | `/crm/sentiment` |

#### Académico
| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Calendario escolar | ✅ | `/calendar` |
| Boletas de calificaciones | ✅ | `/academic/report-cards` |
| Progreso académico | ✅ | `/academic/progress` |
| Disciplina/Conducta | ✅ | `/discipline` |
| Horarios | ✅ | `/schedules` |

#### Finanzas - **🆕 ACTUALIZADO**
| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Pagos y cargos | ✅ | `/payments` |
| **Becas y Descuentos** | ✅ 🆕 | `/admin/scholarships` |
| **Ciclos Escolares** | ✅ 🆕 | `/admin/cycles` |
| Tienda escolar | ✅ | `/store` |

#### Operacional - **🆕 ACTUALIZADO**
| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Inscripciones online | ✅ | `/enrollments` |
| Permisos digitales | ✅ | `/permits` |
| Enfermería | ✅ | `/nurse` |
| Citas padres-maestros | ✅ | `/appointments` |
| **Multi-Tutor (Custodia)** | ✅ 🆕 | `/admin/tutors` |
| **Referidos Escolar** | ✅ 🆕 | `/admin/referrals` |

#### IA y Analytics
| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Chatbot IA | ✅ | `/chatbot` |
| Métricas del chatbot | ✅ | `/chatbot/metrics` |
| Tips con IA | ✅ | API disponible |
| Gamificación | ✅ | API disponible |

---

### 3. PROFESOR
**Descripción:** Gestión académica de grupos asignados.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard | ✅ | `/teacher` |
| Mis grupos | ✅ | `/messages` |
| Crear tareas | ✅ | `/tasks/new` |
| Editar tareas | ✅ | `/tasks/[id]/edit` |
| Calificar entregas | ✅ | `/tasks/[id]` |
| Tomar asistencia | ✅ | `/attendance` |
| Ver horarios | ✅ | `/schedules` |
| Boletas | ✅ | `/academic/report-cards` |
| Progreso de alumnos | ✅ | `/academic/progress` |
| Reportar disciplina | ✅ | `/discipline` |
| Reportar a enfermería | ✅ | `/nurse` |
| Citas con padres | ✅ | `/appointments` |
| Mensajería | ✅ | `/messages` |
| Galería | ✅ | `/gallery` |

---

### 4. PADRE
**Descripción:** Seguimiento de sus hijos y comunicación con la escuela.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard familiar | ✅ | `/dashboard` |
| Ver anuncios | ✅ | `/announcements` |
| Ver tareas de hijos | ✅ | `/tasks` |
| Estado de pagos | ✅ | `/payments` |
| Mensajería | ✅ | `/messages` |
| Calendario | ✅ | `/calendar` |
| Documentos | ✅ | `/documents` |
| Boletas | ✅ | `/academic/report-cards` |
| Asistencia | ✅ | `/attendance` |
| Agendar citas | ✅ | `/appointments` |
| Tienda escolar | ✅ | `/store` |
| Permisos de salida | ✅ | `/permits` |
| **Referir amigos** | ✅ 🆕 | `/referrals` |
| Chatbot IA | ✅ | `/chatbot` |
| Configurar biometría | ✅ | `/profile` |

---

### 5. VOCAL (Vocal de Grupo)
**Descripción:** Representante de padres en un grupo.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Panel de Vocal | ✅ | `/vocal` |
| Gestionar colectas | ✅ | `/vocal/funds` |
| Enviar avisos al grupo | ✅ | `/vocal/announcements` |
| Ver contribuciones | ✅ | `/vocal/funds/[id]` |
| Reportar gastos | ✅ | `/vocal/funds/[id]/expenses` |

---

### 6. ALUMNO (Opcional)
**Descripción:** Acceso limitado para estudiantes mayores.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Ver tareas | ✅ | `/tasks` |
| Entregar tareas | ✅ | `/tasks/[id]` |
| Ver calificaciones | ✅ | `/academic` |
| Calendario | ✅ | `/calendar` |
| **Gamificación** | ✅ 🆕 | API disponible |

---

## 🆕 NUEVOS MÓDULOS (v3.0)

### 1. Módulo de Becas y Descuentos
**Ubicación:** `/admin/scholarships`  
**API:** `/api/scholarships/*`

**Tipos de Becas:**
- Beca Académica
- Beca Deportiva
- Descuento por Hermanos
- Descuento por Pronto Pago
- Descuento por Pago Anual

**Funcionalidades:**
- Crear tipos de becas con reglas
- Asignar becas a estudiantes
- Configurar descuento porcentual o fijo
- Establecer promedio mínimo requerido
- Límite de beneficiarios
- Vigencia de becas

---

### 2. Gestión de Ciclos Escolares
**Ubicación:** `/admin/cycles`  
**API:** `/api/admin/cycles/*`

**Funcionalidades:**
- Crear ciclos escolares (ej: 2026-2027)
- Configurar fechas de inscripción
- Configurar fechas de clases
- Definir cuotas por ciclo
- Promoción automática al siguiente grado
- Activar/desactivar ciclos

**Estados de Ciclo:**
- UPCOMING (Próximo)
- ACTIVE (Activo)
- COMPLETED (Finalizado)
- ARCHIVED (Archivado)

---

### 3. Multi-Tutor (Custodia Compartida)
**Ubicación:** `/admin/tutors`  
**API:** `/api/admin/tutors/*`

**Objetivo:** Soporte para padres divorciados o custodias compartidas.

**Permisos Granulares por Tutor:**
- Ver calificaciones
- Ver asistencia
- Ver pagos
- Realizar pagos
- Recoger al niño
- Comunicarse con maestros
- Recibir notificaciones
- Solicitar permisos

**Tipos de Custodia:**
- Custodia Total
- Custodia Compartida
- Solo Visitas
- Restringida

---

### 4. Programa de Referidos Escolar
**Ubicación:** `/admin/referrals` (admin), `/referrals` (padre)  
**API:** `/api/referrals/*`, `/api/admin/referrals/*`

**Para Padres:**
- Recomendar familias a la escuela
- Ver estado de sus referidos
- Ganar recompensas por inscripciones exitosas

**Para Administradores:**
- Configurar programa de recompensas
- Gestionar leads de referidos
- Actualizar estados
- Aplicar recompensas

**Estados de Referido:**
- PENDING (Pendiente)
- CONTACTED (Contactado)
- INTERESTED (Interesado)
- ENROLLED (Inscrito)
- NOT_INTERESTED (No Interesado)
- ALREADY_REFERRED (Ya Referido)

**Lógica de Atribución:**
- Primera persona en referir gana
- Detección de duplicados por teléfono
- Mensaje: "Alguien ya refirió a esta persona, recoméndanos a alguien más."

---

### 5. Autenticación Biométrica (WebAuthn)
**API:** `/api/auth/webauthn/*`

**Tecnología:** FIDO2/WebAuthn  
**Soporta:**
- Face ID (iOS)
- Touch ID (iOS/Mac)
- Huella Digital (Android)
- Windows Hello
- Llaves de seguridad USB

**Beneficios:**
- Datos biométricos nunca salen del dispositivo
- Más seguro que contraseñas
- Sin costo de APIs externas
- Estándar FIDO2

---

### 6. Sistema de Gamificación
**API:** `/api/gamification/*`

**Componentes:**
- Puntos por acciones
- Insignias por logros
- Niveles de experiencia
- Tabla de líderes
- Rachas diarias

**Acciones que dan puntos:**
- Entregar tarea a tiempo
- Asistencia perfecta semanal
- Participación en actividades
- Buena conducta

---

### 7. Tips y Consejos con IA
**API:** `/api/tips/*`

**Funcionalidades:**
- Generación automática con IA
- Categorización por edad
- Flujo de aprobación
- Personalización por rol

---

## 🔐 SEGURIDAD

### Rate Limiting
| Endpoint | Límite |
|----------|--------|
| Login | 5 intentos/minuto |
| Signup | 3 registros/hora |
| Chatbot | 20 mensajes/minuto |
| Tips Generation | 10 solicitudes/hora |
| PDF Generation | 10/minuto |

### Bloqueo de Cuenta
- 5 intentos fallidos = bloqueo 30 min
- Campo `lockedUntil` en usuario
- Contador `failedLoginAttempts`
- Reset automático en login exitoso

### Headers de Seguridad
- Content-Security-Policy
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (producción)
- Permissions-Policy

---

## 📱 PWA Y ENROLLMENT

### Flujo de Enrollment
1. Admin crea invitación (email + rol)
2. Sistema genera:
   - Token único
   - Código de escuela
   - Contraseña temporal
3. Se envía email con link
4. Usuario escanea QR o abre link
5. Ingresa código + contraseña temporal
6. Completa perfil y establece contraseña
7. Puede configurar biometría

### Instalación PWA
**iOS:**
- Safari > Compartir > Añadir a inicio

**Android:**
- Chrome > Menú > Instalar app

### Publicación en Stores
| Plataforma | Tecnología | Costo |
|------------|------------|-------|
| Android | TWA | $25 USD (una vez) |
| iOS | PWA Builder | $99 USD/año |

---

## 🌐 INTERNACIONALIZACIÓN

### Idiomas Soportados
| Idioma | Código | Bandera |
|--------|--------|--------|
| Español | es | 🇲🇽 |
| Inglés | en | 🇺🇸 |
| Portugués | pt | 🇧🇷 |
| Alemán | de | 🇩🇪 |
| Francés | fr | 🇫🇷 |
| Japonés | ja | 🇯🇵 |

### Módulos Traducidos
- ✅ Navegación
- ✅ Landing Page
- ✅ Dashboard
- ✅ Mensajes
- ✅ Tareas
- ✅ Pagos
- ✅ Invitaciones
- ✅ Encuestas
- ✅ Académico
- ✅ **Becas y Descuentos** 🆕
- ✅ **Ciclos Escolares** 🆕
- ✅ **Multi-Tutor** 🆕
- ✅ **Referidos** 🆕
- ✅ **Gamificación** 🆕
- ✅ **Tips** 🆕
- ✅ **Biometría** 🆕

---

## 💰 MODELO DE NEGOCIO

### Precios por Estudiante/Mes
| Plan | Precio MXN |
|------|------------|
| Básico | $149 |
| Estándar | $199 |
| Premium | $299 |

### Revenue Split
- 50% IA School
- 50% Escuela

### Cuotas de Setup
| Tamaño Escuela | Cuota MXN |
|----------------|----------|
| Micro (<50) | $8,000 |
| Pequeña (50-150) | $15,000 |
| Mediana (150-400) | $25,000 |
| Grande (400-800) | $40,000 |
| Enterprise (800+) | $60,000+ |

### Programa de Afiliados
**Para Padres:**
- 10% de cuota de setup al referir escuela
- 1 año gratis para UN hijo si escuela activa
- Ventana de 30 días para activación

---

## 📈 ESTADO GENERAL

### Completado
- ✅ Core del sistema (95%)
- ✅ Comunicación (100%)
- ✅ Académico (90%)
- ✅ Finanzas (90%)
- ✅ PWA (100%)
- ✅ Seguridad (95%)
- ✅ Internacionalización (90%)

### En Desarrollo
- ⚠️ Reportes PDF avanzados
- ⚠️ Facturación SaaS automática
- ⚠️ Dashboard específico para profesores
- ⚠️ Integración con SEP (México)

### Roadmap Futuro
- 📅 App nativa (React Native)
- 📅 Integración con Google Classroom
- 📅 Módulo de transporte escolar
- 📅 Reconocimiento facial en entrada

---

## 📄 DOCUMENTOS RELACIONADOS

| Documento | Descripción |
|-----------|-------------|
| `PROCESO_ENROLLMENT_PWA.md` | Flujo completo de registro con QR |
| `LISTA_NECESIDADES_VISUALES.md` | Imágenes y videos requeridos |
| `ANALISIS_RIESGOS_SISTEMA.md` | Análisis de seguridad y riesgos |

---

## 🛠️ CREDENCIALES DE PRUEBA COMPLETAS

### Super Administrador (Plataforma Global)
| Email | Contraseña |
|-------|------------|
| `superadmin@iaschool.edu` | `superadmin123` |

### Administradores
| Rol/Área | Email | Contraseña |
|----------|-------|------------|
| **Admin Principal** | `admin@vermontschool.edu` | `admin123` |
| **Cuenta de Prueba** | `john@doe.com` | `johndoe123` |
| Caja/Tesorería | `caja@vermontschool.edu` | `admin123` |
| Enfermería | `enfermeria@vermontschool.edu` | `admin123` |
| Psicología | `psicologia@vermontschool.edu` | `admin123` |
| Consejo Técnico | `consejo@vermontschool.edu` | `admin123` |
| Coordinación | `coordinacion@vermontschool.edu` | `admin123` |
| Recepción | `recepcion@vermontschool.edu` | `admin123` |
| Sistemas | `sistemas@vermontschool.edu` | `admin123` |
| Subdirección | `subdirector@vermontschool.edu` | `admin123` |

### Profesores
| Nombre | Email | Contraseña |
|--------|-------|------------|
| Laura Sánchez | `prof.sanchez@vermontschool.edu` | `profesor123` |
| Carlos Ramírez | `prof.ramirez@vermontschool.edu` | `profesor123` |

### Padres de Familia
| Nombre | Email | Contraseña |
|--------|-------|------------|
| María López | `maria.lopez@email.com` | `padre123` |
| Juan Martínez | `juan.martinez@email.com` | `padre123` |
| Ana Rodríguez | `ana.rodriguez@email.com` | `padre123` |

### Vocal de Grupo
| Email | Contraseña |
|-------|------------|
| `vocal@email.com` | `vocal123` |

### Estudiante
| Nombre | Email | Contraseña |
|--------|-------|------------|
| Sofía López | `sofia.lopez@vermontschool.edu` | `alumno123` |

---

## 🎨 LISTA DE AYUDAS Y APOYOS VISUALES REQUERIDOS

### Videos Tutoriales (14 Videos Recomendados)

| # | Título | Duración | Audiencia |
|---|--------|----------|-----------|
| 1 | Bienvenida y Tour General de IA School | 3-5 min | Todos |
| 2 | Proceso de Registro (Enrollment) con QR | 2-3 min | Nuevos usuarios |
| 3 | Dashboard para Padres de Familia | 3-4 min | Padres |
| 4 | Cómo revisar y pagar colegiaturas | 2-3 min | Padres |
| 5 | Comunicación: Mensajes y Anuncios | 3 min | Padres/Profesores |
| 6 | Dashboard para Profesores | 3-4 min | Profesores |
| 7 | Registro de Asistencia y Calificaciones | 4-5 min | Profesores |
| 8 | Creación y Gestión de Tareas | 3-4 min | Profesores |
| 9 | Panel de Administración Completo | 5-7 min | Admins |
| 10 | Gestión de Becas y Descuentos | 3 min | Admins |
| 11 | Sistema de Invitaciones con QR | 2 min | Admins |
| 12 | Módulo de Enfermería | 2-3 min | Enfermería |
| 13 | Rol de Vocal de Grupo | 3 min | Vocales |
| 14 | Instalación PWA en Móvil (iOS/Android) | 1-2 min | Todos |

### Imágenes e Infografías Necesarias

| # | Recurso | Formato | Uso |
|---|---------|---------|-----|
| 1 | Diagrama de roles y permisos | PNG/SVG | Documentación técnica |
| 2 | Flujo de enrollment con QR | PNG | Manual de usuario |
| 3 | Infografía de funciones por rol | PNG | Material de capacitación |
| 4 | Guía rápida de pagos SPEI | PDF/PNG | Material para padres |
| 5 | Checklist de inicio de ciclo escolar | PDF | Material para admins |
| 6 | Mapa del sistema (sitemap visual) | PNG/SVG | Documentación |
| 7 | Capturas de pantalla de cada módulo | PNG | Manuales |
| 8 | Iconos de los 6 roles del sistema | SVG | UI/Documentación |

### Estrategia de Traducción de Videos

| Idioma | Estrategia Recomendada | Prioridad |
|--------|------------------------|-----------|
| Español (México) | Producción original | Base |
| Inglés | Subtítulos + Voice-over IA | Alta |
| Portugués | Subtítulos + Voice-over IA | Media |
| Alemán | Solo subtítulos | Baja |
| Francés | Solo subtítulos | Baja |
| Japonés | Solo subtítulos | Baja |

### Herramientas Recomendadas para Producción

| Tipo | Herramienta | Uso |
|------|-------------|-----|
| Grabación de Pantalla | Loom / OBS Studio | Videos tutoriales |
| Edición de Video | Capcut / DaVinci Resolve | Post-producción |
| Voice-over IA | ElevenLabs / Murf.ai | Doblaje multilingüe |
| Subtítulos | Subtitle Edit / YouTube | Traducción de videos |
| Diseño Gráfico | Canva / Figma | Infografías |
| Diagramas | Lucidchart / Miro | Flujos y diagramas |

---

## 📄 DOCUMENTOS RELACIONADOS

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| `MANUAL_PRUEBAS_COMPLETO.md` | `/iaschool_app/` | Checklist completo de pruebas |
| `PROCESO_ENROLLMENT_PWA.md` | `/iaschool_app/` | Flujo de registro con QR |
| `LISTA_NECESIDADES_VISUALES.md` | `/iaschool_app/` | Recursos visuales detallados |
| `ANALISIS_RIESGOS_SISTEMA.md` | `/iaschool_app/` | Análisis de seguridad |

---

**Documento generado automáticamente**  
**IA School Platform v3.0**  
**© 2026 Todos los derechos reservados**
