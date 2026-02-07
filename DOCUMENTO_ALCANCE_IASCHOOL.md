# 📚 IA SCHOOL - DOCUMENTO DE ALCANCE COMPLETO
## Plataforma de Gestión Escolar Inteligente

**Versión:** 2.0  
**Fecha:** 7 de Febrero 2026  
**Estado:** Producción  

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Cantidad |
|---------|----------|
| **Páginas/Vistas** | 51 |
| **Endpoints API** | 128 |
| **Modelos de Datos** | 70 |
| **Roles de Usuario** | 6 |
| **Idiomas Soportados** | 6 |

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
| **Reportes consolidados** | ❌ | Pendiente |
| **Facturación SaaS** | ❌ | Pendiente |
| **Métricas de uso global** | ❌ | Pendiente |

---

### 2. ADMIN (Administrador de Escuela)
**Descripción:** Control total de una escuela específica.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard administrativo | ✅ | `/dashboard` |
| Dashboard ejecutivo | ✅ | `/dashboard/executive` |
| Gestión de usuarios | ✅ | `/directory` |
| Invitaciones | ✅ | `/invitations` |
| Importación masiva CSV | ✅ | `/import` |
| Anuncios (crear/editar) | ✅ | `/announcements/new` |
| Calendario escolar | ✅ | `/calendar` |
| Pagos y cargos | ✅ | `/payments` |
| Tienda escolar | ✅ | `/store` |
| Galería de fotos | ✅ | `/gallery` |
| CRM/Mailing | ✅ | `/crm` |
| Encuestas NPS | ✅ | `/surveys` |
| Votaciones | ✅ | `/polls` |
| Inscripciones online | ✅ | `/enrollments` |
| Permisos digitales | ✅ | `/permits` |
| Boletas de calificaciones | ✅ | `/academic/report-cards` |
| Progreso académico | ✅ | `/academic/progress` |
| Disciplina/Conducta | ✅ | `/discipline` |
| Enfermería | ✅ | `/nurse` |
| Citas padres-maestros | ✅ | `/appointments` |
| Chatbot IA | ✅ | `/chatbot` |
| Métricas del chatbot | ✅ | `/chatbot/metrics` |
| Análisis de sentimiento | ✅ | `/crm/sentiment` |
| Métricas del directorio | ✅ | `/directory/metrics` |
| **Sistema de becas** | ❌ | Pendiente |
| **Ciclos escolares** | ❌ | Pendiente |
| **Config. de cuotas** | ❌ | Pendiente |

---

### 3. PROFESOR
**Descripción:** Gestión académica de grupos asignados.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard | ⚠️ Usa el de PADRE | `/dashboard` |
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
| **Dashboard propio** | ❌ | Pendiente |
| **Plantillas de tareas** | ❌ | Pendiente |
| **Banco de recursos** | ❌ | Pendiente |

---

### 4. PADRE
**Descripción:** Seguimiento de hijos y comunicación con la escuela.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard de hijos | ✅ | `/dashboard` |
| Resumen semanal | ✅ | `/dashboard/weekly-summary` |
| Ver mis hijos | ✅ | `API /api/student/my-children` |
| Tareas de hijos | ✅ | `/tasks` |
| Calificaciones | ✅ | `/academic/grades` |
| Documentos académicos | ✅ | `/academic/documents` |
| Progreso | ✅ | `/academic/progress` |
| Asistencia | ✅ | `/attendance` |
| Horarios | ✅ | `/schedules` |
| Pagos | ✅ | `/payments` |
| Tienda | ✅ | `/store` |
| Calendario | ✅ | `/calendar` |
| Anuncios | ✅ | `/announcements` |
| Mensajes | ✅ | `/messages` |
| Documentos firmados | ✅ | `/documents` |
| Solicitar permisos | ✅ | `/permits` |
| Agendar citas | ✅ | `/appointments` |
| Encuestas | ✅ | `/surveys` |
| Votaciones | ✅ | `/polls` |
| Galería | ✅ | `/gallery` |
| Ver grupo (si es vocal) | ✅ | `/vocal` |
| **Ver becas aplicadas** | ❌ | Pendiente |
| **Solicitar beca** | ❌ | Pendiente |
| **Comprobantes de pago** | ❌ | Pendiente |

---

### 5. ALUMNO
**Descripción:** Acceso simplificado para estudiantes.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Dashboard simplificado | ✅ | `/dashboard` |
| Mis tareas | ✅ | `/tasks` |
| Entregar tareas | ✅ | `/tasks/[id]` |
| Ver calificaciones | ⚠️ Parcial | - |
| Horarios | ✅ | `/schedules` |
| Calendario | ✅ | `/calendar` |
| Mensajes | ✅ | `/messages` |
| Equipos de trabajo | ✅ | `/messages/teams` |
| Asistencia | ✅ | `/attendance` |
| Documentos | ✅ | `/documents` |
| Anuncios | ✅ | `/announcements` |
| **Mi progreso (gráficas)** | ❌ | Pendiente |
| **Logros/Gamificación** | ❌ | Pendiente |

---

### 6. VOCAL (Representante de Padres)
**Descripción:** Gestión de fondos y comunicación del grupo.

| Funcionalidad | Estado | Página/API |
|--------------|--------|------------|
| Panel Vocal | ✅ | `/vocal` |
| Crear colectas/fondos | ✅ | `/vocal/funds` |
| Ver detalle de fondo | ✅ | `/vocal/funds/[id]` |
| Registrar pagos | ✅ | `API /api/vocal/funds/[id]/contributions` |
| Registrar gastos | ✅ | `API /api/vocal/funds/[id]/expenses` |
| Avisos al grupo | ✅ | `/vocal/announcements` |
| Soporte multi-grupo | ✅ | Dropdown selector |
| **Dashboard propio** | ❌ | Pendiente |
| **Reportes PDF** | ⚠️ Parcial | Pendiente |

---

## 📡 MÓDULOS DEL SISTEMA

### 📧 COMUNICACIÓN Y MENSAJERÍA

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Chat 1 a 1 | ✅ | Mensajes directos entre usuarios |
| Chat grupal | ✅ | Conversaciones de grupo escolar |
| Reacciones emoji | ✅ | 6 emojis disponibles |
| Mensajes fijados | ✅ | Pin de mensajes importantes |
| Archivos adjuntos | ✅ | Imágenes y documentos vía S3 |
| Equipos de trabajo | ✅ | Para alumnos en proyectos |
| Búsqueda | ✅ | Filtrar conversaciones |
| Notif. tiempo real | ⚠️ | Polling (no WebSocket) |

**APIs:** `/api/conversations/*`, `/api/messages/*`, `/api/teams/*`

---

### 📢 ANUNCIOS Y NOTIFICACIONES

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Anuncios generales | ✅ | Comunicados escolares |
| Prioridad (Normal/Urgente) | ✅ | Destacar anuncios |
| Marcar como leído | ✅ | Tracking de lecturas |
| Conteo de lecturas | ✅ | Para admins |
| Email urgentes | ✅ | Envío automático a padres |
| Anuncios de grupo | ✅ | Para vocales |

**APIs:** `/api/announcements/*`, `/api/vocal/announcements/*`

---

### 📬 CRM Y MAILING (Sistema de Comunicación Masiva)

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Dashboard CRM | ✅ | `/crm` - Estadísticas generales |
| Campañas email | ✅ | Crear y enviar campañas |
| Segmentos | ✅ | Agrupar destinatarios |
| Plantillas | ✅ | Templates reutilizables |
| Tracking apertura | ✅ | Métricas de emails |
| Historial envíos | ✅ | Log de comunicaciones |
| Análisis sentimiento | ✅ | `/crm/sentiment` - IA analiza mensajes |

**APIs:**
- `/api/crm/stats` - Estadísticas
- `/api/crm/campaigns` - Gestión campañas
- `/api/crm/segments` - Segmentos
- `/api/crm/templates` - Plantillas
- `/api/messages/sentiment` - Análisis IA

**Modelos de datos:**
- `CrmSegment` - Segmentos de audiencia
- `CrmCampaign` - Campañas de email
- `CrmCampaignRecipient` - Destinatarios
- `EmailTemplate` - Plantillas
- `CommunicationLog` - Historial

---

### 🔔 NOTIFICACIONES POR EMAIL (Automáticas)

| Tipo | ID | Trigger |
|------|----|---------|
| Invitación de usuario | `NOTIF_ID_INVITACIN_DE_USUARIO` | Al invitar nuevo usuario |
| Nueva tarea asignada | `NOTIF_ID_NUEVA_TAREA_ASIGNADA` | Profesor publica tarea |
| Tarea calificada | `NOTIF_ID_TAREA_CALIFICADA` | Profesor califica |
| Pago próximo a vencer | `NOTIF_ID_PAGO_PRXIMO_A_VENCER` | Recordatorio pagos |
| Anuncio importante | `NOTIF_ID_NUEVO_ANUNCIO_IMPORTANTE` | Anuncio urgente |
| Campaña comunicación | `NOTIF_ID_CAMPAA_DE_COMUNICACIN` | Envío masivo CRM |

**Archivo:** `lib/send-notification.ts`

---

### 📱 NOTIFICACIONES PUSH (PWA)

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Service Worker | ✅ | `/public/sw.js` |
| Manifest PWA | ✅ | `/public/manifest.json` |
| Suscripción push | ✅ | `/api/push/subscribe` |
| Cancelar suscripción | ✅ | `/api/push/unsubscribe` |
| Enviar notificación | ✅ | `/api/push/send` |
| Prompt instalación | ✅ | Componente iOS/Android |
| Página offline | ✅ | `/public/offline.html` |
| Modelo BD | ✅ | `PushSubscription` |

---

### 📚 ACADÉMICO

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Materias | ✅ | Configurables por escuela |
| Grupos/Grados | ✅ | Organización de alumnos |
| Tareas | ✅ | Crear, editar, publicar |
| Entregas | ✅ | Subir archivos |
| Calificaciones | ✅ | Por tarea y materia |
| Boletas | ✅ | Generación PDF |
| Progreso académico | ✅ | Gráficas por estudiante |
| Documentos académicos | ✅ | Constancias, etc. |
| Alertas académicas | ✅ | Promedio bajo |
| Horarios | ✅ | Visualización semanal |

**APIs:** `/api/academic/*`, `/api/tasks/*`, `/api/subjects/*`, `/api/schedules/*`

---

### 💰 PAGOS Y FINANZAS

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Cargos | ✅ | Colegiaturas, inscripciones |
| Registro de pagos | ✅ | Manual por admin |
| Estado de cuenta | ✅ | Vista para padres |
| Referencias SPEI | ✅ | Pago bancario |
| Configuración banco | ✅ | Por escuela |
| Recordatorios | ✅ | Email automático |
| Tipos de cargo | ✅ | Enum configurable |
| **Becas/Descuentos** | ❌ | PENDIENTE |
| **Pronto pago** | ❌ | PENDIENTE |
| **Desc. hermanos** | ❌ | PENDIENTE |

**APIs:** `/api/charges/*`

---

### 🩺 ENFERMERÍA Y SALUD

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Visitas enfermería | ✅ | Registro de atenciones |
| Info médica alumno | ✅ | Alergias, condiciones |
| Contacto emergencia | ✅ | Datos familiares |
| Historial médico | ✅ | Por estudiante |

**APIs:** `/api/nurse/*`

---

### 📋 DISCIPLINA Y CONDUCTA

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Registro incidentes | ✅ | Por profesor/admin |
| Tipos de incidente | ✅ | Configurable |
| Severidad | ✅ | Leve/Moderado/Grave |
| Historial alumno | ✅ | Vista completa |
| Notif. a padres | ⚠️ | Parcial |

**APIs:** `/api/discipline/*`

---

### 📅 CALENDARIO Y EVENTOS

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Calendario escolar | ✅ | Vista mensual |
| Eventos | ✅ | Crear/editar |
| Confirmación asistencia | ✅ | RSVP |
| Exportar iCal | ✅ | Google Calendar |
| Integración GCal | ✅ | Sincronización |

**APIs:** `/api/events/*`, `/api/calendar/*`

---

### 🎥 CITAS Y VIDEOCONFERENCIAS

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Disponibilidad profesor | ✅ | Configurar horarios |
| Agendar cita | ✅ | Padres solicitan |
| Aprobar/Rechazar | ✅ | Profesor decide |
| Videoconferencia | ✅ | Jitsi Meet integrado |
| Historial citas | ✅ | Por usuario |

**APIs:** `/api/appointments/*`

---

### 🗳️ ENCUESTAS Y VOTACIONES

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Encuestas NPS | ✅ | Satisfacción |
| Preguntas múltiples | ✅ | Varios tipos |
| Respuestas anónimas | ✅ | Opcional |
| Resultados | ✅ | Gráficas |
| Votaciones/Polls | ✅ | Decisiones rápidas |

**APIs:** `/api/surveys/*`, `/api/polls/*`

---

### 🛒 TIENDA ESCOLAR

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Categorías | ✅ | Uniformes, libros, materiales |
| Productos | ✅ | Con variantes (tallas, colores) |
| Carrito | ✅ | Por usuario |
| Órdenes | ✅ | Historial compras |
| Productos ejemplo | ✅ | 24 productos seed |

**APIs:** `/api/store/*`

---

### 📷 GALERÍA DE FOTOS

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Álbumes | ✅ | Organización |
| Subir fotos | ✅ | Múltiples |
| Etiquetado alumnos | ✅ | Manual |
| Análisis IA | ✅ | Reconocimiento facial |
| Fotos por alumno | ✅ | Filtro automático |

**APIs:** `/api/gallery/*`

---

### 📝 DOCUMENTOS DIGITALES

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Subir documentos | ✅ | PDF, Word |
| Firma digital | ✅ | Padres firman |
| Verificación firma | ✅ | QR/código |
| Permisos | ✅ | Salidas, ausencias |
| Constancias | ✅ | Generación |

**APIs:** `/api/documents/*`, `/api/permits/*`

---

### 📥 INSCRIPCIONES ONLINE

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Formulario público | ✅ | Sin login |
| Datos completos | ✅ | Alumno + padres |
| Gestión solicitudes | ✅ | Admin aprueba |
| Estados | ✅ | Pendiente/Aprobado/Rechazado |

**APIs:** `/api/enrollments/*`

---

### 🤖 CHATBOT IA

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Chat embebido | ✅ | Asistente IA |
| Historial | ✅ | Conversaciones |
| Métricas uso | ✅ | Dashboard |
| Contexto escolar | ✅ | Conoce la escuela |

**APIs:** `/api/chatbot/*`

---

### 👥 VOCAL DE GRUPO

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Asignación vocal | ✅ | Admin asigna |
| Multi-grupo | ✅ | Un vocal, varios grupos |
| Fondos/Colectas | ✅ | Crear campañas |
| Contribuciones | ✅ | Pagado/Pendiente/Exento |
| Gastos | ✅ | Registro con evidencia |
| Avisos grupo | ✅ | Solo para padres |

**APIs:** `/api/vocal/*`

---

### 🔐 SEGURIDAD

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Autenticación | ✅ | NextAuth + bcrypt |
| Roles y permisos | ✅ | Middleware protección |
| Headers seguridad | ✅ | X-Frame, XSS, etc. |
| Auditoría | ✅ | Logs de acciones |
| Invitaciones seguras | ✅ | Token + código |

---

### 🌐 INTERNACIONALIZACIÓN

| Idioma | Código | Estado |
|--------|--------|--------|
| Español | es | ✅ |
| Inglés | en | ✅ |
| Portugués | pt | ✅ |
| Alemán | de | ✅ |
| Francés | fr | ✅ |
| Japonés | ja | ✅ |

---

### 📱 PWA (Progressive Web App)

| Componente | Estado |
|------------|--------|
| Manifest.json | ✅ |
| Service Worker | ✅ |
| Offline page | ✅ |
| Install prompt | ✅ |
| Push notifications | ✅ |
| Cache strategy | ✅ |

---

## ❌ FUNCIONALIDADES PENDIENTES (GAP ANALYSIS)

### PRIORIDAD ALTA (Crítico para ventas)

| Funcionalidad | Impacto | Esfuerzo |
|--------------|---------|----------|
| **Sistema de Becas/Descuentos** | 🔴 Alto | Medio |
| **Dashboard específico PROFESOR** | 🔴 Alto | Bajo |
| **Dashboard específico VOCAL** | 🟡 Medio | Bajo |
| **Comprobantes de pago PDF** | 🔴 Alto | Bajo |
| **Descuento por hermanos** | 🟡 Medio | Medio |
| **Descuento pronto pago** | 🟡 Medio | Medio |

### PRIORIDAD MEDIA

| Funcionalidad | Impacto | Esfuerzo |
|--------------|---------|----------|
| Gestión de ciclos escolares | 🟡 Medio | Medio |
| Promoción automática de grado | 🟡 Medio | Medio |
| Plantillas de tareas | 🟢 Bajo | Bajo |
| Multi-tutor (divorcios) | 🟡 Medio | Medio |
| Reportes consolidados Super Admin | 🟡 Medio | Alto |

### PRIORIDAD BAJA

| Funcionalidad | Impacto | Esfuerzo |
|--------------|---------|----------|
| Gamificación/Logros alumnos | 🟢 Bajo | Alto |
| Banco de recursos docente | 🟢 Bajo | Medio |
| WebSockets tiempo real | 🟢 Bajo | Alto |
| Facturación SaaS integrada | 🟢 Bajo | Alto |

---

## 📈 ESTADÍSTICAS TÉCNICAS

```
Páginas totales: 51
Endpoints API: 128
Modelos de BD: 70
Líneas schema: 2,331
Tipos de notificación email: 6
Idiomas: 6
```

---

## 🔑 CREDENCIALES DE PRUEBA

| Rol | Email | Password |
|-----|-------|----------|
| Super Admin | superadmin@iaschool.edu | superadmin123 |
| Admin | admin@vermontschool.edu | admin123 |
| Padre | maria.lopez@email.com | padre123 |

---

## 🏗️ ARQUITECTURA TÉCNICA

- **Framework:** Next.js 14 (App Router)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth.js
- **Almacenamiento:** AWS S3
- **Estilos:** Tailwind CSS + shadcn/ui
- **Email:** Abacus.AI Notification API
- **IA:** Abacus.AI LLM API
- **Video:** Jitsi Meet

---

## 📋 CONCLUSIÓN

IA School es una plataforma **85% completa** con los módulos core funcionando. Los gaps principales son:

1. **Sistema de Becas** - Diferenciador de mercado
2. **Dashboards específicos por rol** - UX mejorada
3. **Gestión de ciclos escolares** - Operación anual

---

*Documento generado el 7 de Febrero 2026*
