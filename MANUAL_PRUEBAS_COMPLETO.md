# 📋 Manual Completo de Pruebas - IA School

**Versión:** 3.0  
**Fecha:** Febrero 2026  
**Plataforma:** IA School (Vermont School SaaS)  

---

## 🔐 CREDENCIALES DE PRUEBA POR ROL

### Super Administrador (Plataforma Global)
| Campo | Valor |
|-------|-------|
| **Email** | `superadmin@iaschool.edu` |
| **Contraseña** | `superadmin123` |
| **Acceso** | Gestión de todas las escuelas, configuración del sistema, logs de auditoría |

---

### Administrador - Dirección
| Campo | Valor |
|-------|-------|
| **Email** | `admin@vermontschool.edu` |
| **Contraseña** | `admin123` |
| **Rol** | Director General |
| **Acceso** | Dashboard completo, todas las funciones administrativas |

---

### Cuenta de Prueba (Admin)
| Campo | Valor |
|-------|-------|
| **Email** | `john@doe.com` |
| **Contraseña** | `johndoe123` |
| **Rol** | Admin |
| **Uso** | Cuenta para pruebas generales |

---

### Administradores por Área Funcional

| Área | Email | Contraseña | Subroles |
|------|-------|------------|----------|
| **Caja/Tesorería** | `caja@vermontschool.edu` | `admin123` | CAJA |
| **Enfermería** | `enfermeria@vermontschool.edu` | `admin123` | ENFERMERIA |
| **Psicología** | `psicologia@vermontschool.edu` | `admin123` | PSICOLOGIA |
| **Consejo Técnico** | `consejo@vermontschool.edu` | `admin123` | CONSEJO |
| **Coordinación** | `coordinacion@vermontschool.edu` | `admin123` | COORDINACION |
| **Recepción** | `recepcion@vermontschool.edu` | `admin123` | RECEPCION |
| **Sistemas** | `sistemas@vermontschool.edu` | `admin123` | SISTEMAS |
| **Subdirección** | `subdirector@vermontschool.edu` | `admin123` | SUBDIRECCION |

---

### Profesores
| Nombre | Email | Contraseña | Materia |
|--------|-------|------------|--------|
| **Laura Sánchez** | `prof.sanchez@vermontschool.edu` | `profesor123` | Matemáticas |
| **Carlos Ramírez** | `prof.ramirez@vermontschool.edu` | `profesor123` | Español |

---

### Padres de Familia
| Nombre | Email | Contraseña | Hijos |
|--------|-------|------------|-------|
| **María López** | `maria.lopez@email.com` | `padre123` | Sofía López |
| **Juan Martínez** | `juan.martinez@email.com` | `padre123` | Carlos Martínez |
| **Ana Rodríguez** | `ana.rodriguez@email.com` | `padre123` | (Estudiante asignado) |

---

### Vocal de Grupo
| Campo | Valor |
|-------|-------|
| **Email** | `vocal@email.com` |
| **Contraseña** | `vocal123` |
| **Rol** | Representante de grupo de padres |
| **Acceso** | Colectas, anuncios de grupo, encuestas |

---

### Estudiante
| Nombre | Email | Contraseña |
|--------|-------|------------|
| **Sofía López** | `sofia.lopez@vermontschool.edu` | `alumno123` |

---

## 📝 CHECKLIST DE PRUEBAS POR MÓDULO

### 1. LANDING PAGE Y REGISTRO

#### 1.1 Página de Inicio
- [ ] Verificar carga de la landing page
- [ ] Comprobar selector de idiomas (6 idiomas)
- [ ] Verificar animaciones del hero
- [ ] Confirmar enlaces del menú de navegación
- [ ] Revisar secciones: Para Familias, Para Profesores
- [ ] Verificar footer con información de contacto
- [ ] Probar botón "Solicitar Demo"

#### 1.2 Sistema de Invitaciones (Admin → Usuario)
- [ ] **Admin**: Ir a `/invitations`
- [ ] Crear nueva invitación con email y rol
- [ ] Verificar generación de código temporal
- [ ] Copiar enlace de registro
- [ ] Verificar envío de email (si configurado)
- [ ] **Usuario**: Usar enlace de registro
- [ ] Completar proceso de enrollment en `/enroll`
- [ ] Validar código escolar y contraseña temporal
- [ ] Crear nueva contraseña
- [ ] Verificar acceso con nuevas credenciales

#### 1.3 Login y Autenticación
- [ ] Probar login con cada tipo de usuario
- [ ] Verificar redirección según rol
- [ ] Probar "Olvidé mi contraseña" (si disponible)
- [ ] Verificar cierre de sesión
- [ ] Confirmar persistencia de sesión

---

### 2. DASHBOARD POR ROL

#### 2.1 Dashboard Super Admin
Ruta: `/super-admin`
- [ ] Ver estadísticas globales de escuelas
- [ ] Listar todas las escuelas
- [ ] Crear nueva escuela
- [ ] Ver configuración del sistema
- [ ] Consultar logs de auditoría

#### 2.2 Dashboard Admin
Ruta: `/dashboard`
- [ ] Ver resumen de anuncios
- [ ] Estadísticas de padres registrados
- [ ] Contador de mensajes no leídos
- [ ] Eventos próximos
- [ ] Tareas pendientes

#### 2.3 Dashboard Profesor
Ruta: `/teacher` o `/dashboard`
- [ ] Ver grupos asignados
- [ ] Tareas del día
- [ ] Calendario de clases
- [ ] Acceso a asistencia

#### 2.4 Dashboard Padre
Ruta: `/dashboard`
- [ ] Ver anuncios no leídos
- [ ] Estado de pagos
- [ ] Tareas de hijos
- [ ] Eventos próximos
- [ ] Mensajes nuevos

#### 2.5 Dashboard Vocal
Ruta: `/vocal`
- [ ] Ver colectas activas
- [ ] Anuncios del grupo
- [ ] Encuestas pendientes

---

### 3. COMUNICACIÓN

#### 3.1 Anuncios (`/announcements`)
**Admin:**
- [ ] Crear nuevo anuncio
- [ ] Seleccionar prioridad (Normal, Importante, Urgente)
- [ ] Ver estadísticas de lectura
- [ ] Eliminar anuncio

**Padre/Profesor:**
- [ ] Ver lista de anuncios
- [ ] Marcar como leído
- [ ] Filtrar por fecha/prioridad

#### 3.2 Mensajería (`/messages`)
- [ ] Ver conversaciones directas
- [ ] Ver chats de grupo
- [ ] Crear nueva conversación
- [ ] Enviar mensaje de texto
- [ ] Adjuntar archivo/imagen
- [ ] Usar reacciones (emojis)
- [ ] Fijar mensaje importante
- [ ] Ver mensajes fijados
- [ ] Buscar en conversaciones

#### 3.3 Directorio (`/directory`)
- [ ] Buscar por nombre/email
- [ ] Filtrar por rol
- [ ] Filtrar por grupo
- [ ] Ver información de contacto
- [ ] Exportar a CSV

---

### 4. GESTIÓN ACADÉMICA

#### 4.1 Grupos (`/admin/groups` o menú Admin)
- [ ] Listar grupos activos
- [ ] Ver alumnos por grupo
- [ ] Asignar profesor titular
- [ ] Ver horarios del grupo

#### 4.2 Asistencia (`/attendance`)
**Profesor:**
- [ ] Seleccionar grupo
- [ ] Tomar asistencia del día
- [ ] Marcar: Presente, Ausente, Tardanza, Justificado
- [ ] Agregar notas
- [ ] Guardar asistencia

**Padre:**
- [ ] Ver historial de asistencia del hijo
- [ ] Ver porcentaje de asistencia

#### 4.3 Tareas (`/tasks`)
**Profesor:**
- [ ] Crear nueva tarea
- [ ] Asignar a grupo/materia
- [ ] Establecer fecha límite
- [ ] Adjuntar archivos
- [ ] Ver entregas
- [ ] Calificar entregas
- [ ] Dar retroalimentación

**Padre/Alumno:**
- [ ] Ver tareas pendientes
- [ ] Entregar tarea
- [ ] Ver calificación y comentarios

#### 4.4 Calificaciones (`/academic/grades`)
**Profesor:**
- [ ] Registrar calificaciones por período
- [ ] Ver promedios del grupo

**Padre:**
- [ ] Ver calificaciones del hijo
- [ ] Ver progreso académico

#### 4.5 Boletas (`/academic/report-cards`)
- [ ] Generar boleta de calificaciones
- [ ] Descargar PDF
- [ ] Ver historial de boletas

---

### 5. GESTIÓN FINANCIERA

#### 5.1 Pagos (`/payments`)
**Admin/Caja:**
- [ ] Ver cargos pendientes
- [ ] Registrar pago recibido
- [ ] Seleccionar método de pago
- [ ] Generar recibo

**Padre:**
- [ ] Ver estado de cuenta
- [ ] Ver cargos pendientes
- [ ] Ver historial de pagos
- [ ] Ver datos bancarios (SPEI)

#### 5.2 Cargos (`/admin/charges` o Panel Admin)
- [ ] Crear cargo individual
- [ ] Crear cargo masivo (a todos los alumnos)
- [ ] Tipos: Colegiatura, Inscripción, Material, Uniforme, Evento, Transporte

#### 5.3 Becas y Descuentos (`/admin/scholarships`)
- [ ] Crear tipo de beca
  - [ ] Académica
  - [ ] Deportiva
  - [ ] Descuento hermanos
  - [ ] Pronto pago
  - [ ] Pago anual
- [ ] Definir porcentaje o monto fijo
- [ ] Asignar beca a estudiante
- [ ] Ver beneficiarios

#### 5.4 Tienda Escolar (`/store`)
- [ ] Ver catálogo de productos
- [ ] Filtrar por categoría (Uniformes, Libros, Materiales)
- [ ] Ver detalles de producto
- [ ] Agregar al carrito
- [ ] Realizar compra

---

### 6. CALENDARIO Y EVENTOS

#### 6.1 Calendario (`/calendar`)
- [ ] Ver vista mensual
- [ ] Ver vista semanal
- [ ] Ver eventos del día
- [ ] Crear nuevo evento (Admin)
- [ ] Ver detalles de evento

#### 6.2 Eventos (`/events`)
- [ ] Ver lista de eventos
- [ ] Confirmar asistencia
- [ ] Ver ubicación
- [ ] Ver asistentes confirmados

---

### 7. DOCUMENTOS Y FIRMA

#### 7.1 Documentos (`/documents`)
**Admin:**
- [ ] Crear nuevo documento
- [ ] Subir PDF/archivo
- [ ] Asignar a grupo/usuarios
- [ ] Requerir firma

**Padre:**
- [ ] Ver documentos pendientes
- [ ] Firmar documento digitalmente
- [ ] Verificar código de documento
- [ ] Descargar documento firmado

---

### 8. CITAS Y PERMISOS

#### 8.1 Citas (`/appointments`)
**Profesor:**
- [ ] Configurar disponibilidad
- [ ] Ver citas agendadas
- [ ] Confirmar/rechazar cita
- [ ] Marcar como completada

**Padre:**
- [ ] Ver profesores disponibles
- [ ] Solicitar cita
- [ ] Seleccionar fecha/hora
- [ ] Ver mis citas
- [ ] Cancelar cita

#### 8.2 Permisos (`/permits`)
**Padre:**
- [ ] Solicitar permiso de salida
- [ ] Indicar motivo y persona autorizada

**Admin:**
- [ ] Aprobar/rechazar permiso
- [ ] Ver historial de permisos

---

### 9. MÓDULOS ESPECIALIZADOS

#### 9.1 Enfermería (`/nurse`)
- [ ] Registrar visita médica
- [ ] Ver historial del alumno
- [ ] Registrar medicamentos
- [ ] Alertas de salud

#### 9.2 Disciplina (`/discipline`)
- [ ] Registrar incidente
- [ ] Asignar consecuencia
- [ ] Notificar a padres
- [ ] Marcar como resuelto

#### 9.3 Encuestas (`/polls`)
**Vocal/Admin:**
- [ ] Crear nueva encuesta
- [ ] Agregar opciones
- [ ] Establecer fecha límite
- [ ] Ver resultados

**Padre:**
- [ ] Votar en encuesta
- [ ] Ver resultados (si permitido)

#### 9.4 Galería (`/gallery`)
- [ ] Ver álbumes
- [ ] Ver fotos de eventos
- [ ] Descargar fotos
- [ ] Etiquetar alumnos (Admin)

---

### 10. CRM Y MARKETING

#### 10.1 CRM (`/crm`)
- [ ] Ver contactos/leads
- [ ] Crear campaña de email
- [ ] Usar plantillas
- [ ] Ver métricas de campaña
- [ ] Segmentar audiencia

#### 10.2 Referidos (`/admin/referrals`)
- [ ] Ver programa de referidos
- [ ] Registrar referido
- [ ] Ver estado de conversión
- [ ] Asignar recompensas

---

### 11. CONFIGURACIÓN ADMINISTRATIVA

#### 11.1 Ciclos Escolares (`/admin/cycles`)
- [ ] Crear nuevo ciclo escolar
- [ ] Definir fechas de inicio/fin
- [ ] Configurar cuotas
- [ ] Activar ciclo
- [ ] Ver inscripciones por ciclo

#### 11.2 Multi-Tutores (`/admin/tutors`)
- [ ] Ver alumnos con múltiples tutores
- [ ] Agregar tutor adicional
- [ ] Configurar permisos por tutor
- [ ] Definir tipo de custodia

#### 11.3 Importación de Datos (`/import`)
- [ ] Descargar plantilla CSV
- [ ] Importar alumnos masivamente
- [ ] Verificar errores de importación

---

### 12. CHATBOT / ASISTENTE IA (`/chatbot`)
- [ ] Abrir conversación con el bot
- [ ] Hacer preguntas frecuentes
- [ ] Calificar respuestas
- [ ] Ver historial de conversaciones

---

### 13. PWA E INSTALACIÓN

#### 13.1 Instalación en Móvil
**iOS (Safari):**
- [ ] Abrir la app en Safari
- [ ] Tocar icono de compartir
- [ ] Seleccionar "Agregar a pantalla de inicio"
- [ ] Verificar icono en home screen

**Android (Chrome):**
- [ ] Abrir la app en Chrome
- [ ] Ver prompt de instalación
- [ ] Instalar aplicación
- [ ] Verificar icono en home screen

#### 13.2 Notificaciones Push
- [ ] Permitir notificaciones
- [ ] Recibir notificación de anuncio urgente
- [ ] Recibir notificación de mensaje
- [ ] Recibir notificación de tarea

---

### 14. CONFIGURACIÓN GLOBAL

#### 14.1 Perfil de Usuario
- [ ] Ver perfil
- [ ] Editar nombre/teléfono
- [ ] Cambiar contraseña
- [ ] Subir foto de perfil

#### 14.2 Preferencias
- [ ] Cambiar idioma
- [ ] Configurar notificaciones
- [ ] Modo oscuro (si disponible)

---

## 🎨 RECURSOS VISUALES NECESARIOS

### Videos Tutoriales (Por Crear)

| # | Video | Duración Sugerida | Audiencia |
|---|-------|-------------------|----------|
| 1 | **Bienvenida y Tour General** | 3-5 min | Todos |
| 2 | **Proceso de Registro (Enrollment)** | 2-3 min | Nuevos usuarios |
| 3 | **Dashboard para Padres** | 3-4 min | Padres |
| 4 | **Cómo revisar y pagar colegiaturas** | 2-3 min | Padres |
| 5 | **Comunicación: Mensajes y Anuncios** | 3 min | Padres/Profesores |
| 6 | **Dashboard para Profesores** | 3-4 min | Profesores |
| 7 | **Asistencia y Calificaciones** | 4-5 min | Profesores |
| 8 | **Creación y Gestión de Tareas** | 3-4 min | Profesores |
| 9 | **Panel de Administración** | 5-7 min | Admins |
| 10 | **Gestión de Becas y Descuentos** | 3 min | Admins |
| 11 | **Sistema de Invitaciones** | 2 min | Admins |
| 12 | **Módulo de Enfermería** | 2-3 min | Enfermería |
| 13 | **Rol de Vocal de Grupo** | 3 min | Vocales |
| 14 | **Instalación PWA en Móvil** | 1-2 min | Todos |

### Imágenes e Infografías

| # | Recurso | Uso |
|---|---------|----|
| 1 | Diagrama de roles y permisos | Documentación técnica |
| 2 | Flujo de enrollment | Manual de usuario |
| 3 | Infografía de funciones por rol | Material de capacitación |
| 4 | Guía rápida de pagos | Material para padres |
| 5 | Checklist de inicio de ciclo | Material para admins |
| 6 | Mapa del sistema (sitemap visual) | Documentación |

### Estrategia de Traducción de Videos

**Opción Recomendada:** Subtítulos profesionales + Voice-over IA selectivo

| Idioma | Estrategia | Prioridad |
|--------|------------|----------|
| Español (MX) | Original - voz nativa | Base |
| Inglés | Subtítulos + VO IA | Alta |
| Portugués | Subtítulos + VO IA | Media |
| Alemán | Solo subtítulos | Baja |
| Francés | Solo subtítulos | Baja |
| Japonés | Solo subtítulos | Baja |

---

## 🔧 NOTAS TÉCNICAS

### Base de Datos
- **Motor:** PostgreSQL
- **ORM:** Prisma 6.7
- **Modelos:** 75+ tablas

### Migraciones Pendientes
Después de esta actualización, ejecutar:
```bash
cd /home/ubuntu/iaschool_app/nextjs_space
yarn prisma db push
yarn prisma generate
```

### Variables de Entorno Requeridas
- `DATABASE_URL` - Conexión PostgreSQL
- `NEXTAUTH_SECRET` - Secreto de autenticación
- `NEXTAUTH_URL` - URL de la aplicación
- `AWS_*` - Configuración S3 para archivos
- `ABACUSAI_API_KEY` - Para chatbot IA

---

## 📊 ESTADÍSTICAS DEL SISTEMA

| Métrica | Valor |
|---------|-------|
| **Total de páginas** | 56+ |
| **Endpoints API** | 140+ |
| **Modelos de datos** | 75+ |
| **Idiomas soportados** | 6 |
| **Roles de usuario** | 6 |
| **Subroles admin** | 9 |

---

**Documento generado por DeepAgent - Febrero 2026**  
**IA School v3.0 - Plataforma de Gestión Escolar**
