# Lista de Necesidades Visuales - IA School

## 🎨 Resumen de Recursos Visuales Necesarios

Este documento lista todos los recursos visuales (imágenes, videos, tutoriales) necesarios para la plataforma IA School.

---

## 📹 Videos Tutoriales Requeridos

### Por Rol de Usuario

#### Para Administradores
| # | Video | Duración Est. | Prioridad |
|---|-------|--------------|----------|
| 1 | Configuración inicial de la escuela | 3-5 min | Alta |
| 2 | Cómo crear invitaciones para padres/profesores | 2 min | Alta |
| 3 | Gestión de ciclos escolares | 3 min | Media |
| 4 | Configuración de becas y descuentos | 3 min | Media |
| 5 | Gestión de multi-tutor (custodia compartida) | 2 min | Media |
| 6 | Configuración del programa de referidos | 2 min | Baja |
| 7 | Panel de CRM y campañas de email | 4 min | Baja |
| 8 | Configuración de la tienda escolar | 3 min | Baja |
| 9 | Importación masiva de datos (CSV) | 2 min | Media |
| 10 | Generación de reportes | 2 min | Media |

#### Para Profesores
| # | Video | Duración Est. | Prioridad |
|---|-------|--------------|----------|
| 1 | Dashboard del profesor | 2 min | Alta |
| 2 | Cómo crear y publicar tareas | 3 min | Alta |
| 3 | Registro de asistencia | 2 min | Alta |
| 4 | Calificación de tareas | 2 min | Alta |
| 5 | Comunicación con padres | 2 min | Media |
| 6 | Horarios y calendario | 1 min | Baja |

#### Para Padres de Familia
| # | Video | Duración Est. | Prioridad |
|---|-------|--------------|----------|
| 1 | Cómo activar tu cuenta (enrollment) | 2 min | Alta |
| 2 | Instalar la app en tu celular (PWA) | 1 min | Alta |
| 3 | Configurar autenticación biométrica | 1 min | Media |
| 4 | Ver tareas y calificaciones de tus hijos | 2 min | Alta |
| 5 | Cómo hacer pagos | 2 min | Alta |
| 6 | Enviar mensajes a profesores | 1 min | Media |
| 7 | Solicitar permisos de salida | 1 min | Baja |
| 8 | Programa de referidos | 1 min | Baja |
| 9 | Tienda escolar - hacer pedidos | 2 min | Baja |
| 10 | Consultar el calendario de eventos | 1 min | Baja |

#### Para Vocales de Grupo
| # | Video | Duración Est. | Prioridad |
|---|-------|--------------|----------|
| 1 | Panel del Vocal de Grupo | 2 min | Alta |
| 2 | Crear y gestionar colectas | 3 min | Alta |
| 3 | Comunicar avisos al grupo | 2 min | Media |

---

## 🖼️ Imágenes Necesarias

### Landing Page
| # | Imagen | Especificaciones | Estado |
|---|--------|-----------------|--------|
| 1 | Hero principal (estudiantes) | 1920x1080, escena escolar | ✅ Existe |
| 2 | Hero familias | 1312x736, familia con tablet | ✅ Existe |
| 3 | Hero profesores | 1776x999, profesor con laptop | ✅ Existe |
| 4 | Logo IA School | SVG/PNG, fondo transparente | ✅ Existe |
| 5 | OG Image (Open Graph) | 1200x630, para compartir en redes | ✅ Existe |
| 6 | Favicon | SVG, 32x32 | ✅ Existe |

### Iconografía de Módulos
| # | Icono | Uso | Estado |
|---|-------|-----|--------|
| 1 | Comunicación | Feature card | ✅ Lucide |
| 2 | Académico | Feature card | ✅ Lucide |
| 3 | Pagos | Feature card | ✅ Lucide |
| 4 | IA/Bot | Feature card | ✅ Lucide |
| 5 | Calendario | Feature card | ✅ Lucide |
| 6 | Seguridad | Feature card | ✅ Lucide |

### Imágenes de Onboarding
| # | Imagen | Descripción | Estado |
|---|--------|------------|--------|
| 1 | Welcome screen | Ilustración de bienvenida | ❌ Pendiente |
| 2 | Setup profile | Ilustración configurar perfil | ❌ Pendiente |
| 3 | Add children | Ilustración agregar hijos | ❌ Pendiente |
| 4 | All set | Ilustración listo para usar | ❌ Pendiente |

### Imágenes Empty States
| # | Imagen | Página | Estado |
|---|--------|--------|--------|
| 1 | No messages | Mensajes vacíos | ❌ Pendiente |
| 2 | No tasks | Sin tareas | ❌ Pendiente |
| 3 | No payments | Sin pagos pendientes | ❌ Pendiente |
| 4 | No announcements | Sin comunicados | ❌ Pendiente |
| 5 | No documents | Sin documentos | ❌ Pendiente |

---

## 🌐 Traducción y Subtítulos

### Estrategia para Videos Multilingües

#### Opción A: Subtítulos (Recomendada)
- **Costo:** Bajo
- **Tiempo:** Rápido
- **Cómo hacerlo:**
  1. Grabar videos en español
  2. Crear archivo SRT con subtítulos en español
  3. Traducir SRT a inglés usando:
     - DeepL/ChatGPT para traducción del texto
     - Mantener los mismos timestamps
  4. Subir a YouTube/Vimeo con múltiples tracks de subtítulos
  5. Usuarios eligen idioma de subtítulos

```srt
# Ejemplo de archivo SRT
1
00:00:01,000 --> 00:00:04,000
Bienvenido a IA School

1 (English)
00:00:01,000 --> 00:00:04,000
Welcome to IA School
```

#### Opción B: Doblaje con IA
- **Costo:** Medio
- **Tiempo:** Medio
- **Cómo hacerlo:**
  1. Grabar videos en español
  2. Usar herramientas como:
     - **ElevenLabs** (voz sintética)
     - **HeyGen** (lip sync con IA)
     - **Rask AI** (doblaje automático)
  3. Sincronizar audio con video

#### Opción C: Videos Separados
- **Costo:** Alto
- **Tiempo:** Lento
- **Cómo hacerlo:**
  1. Grabar cada video en cada idioma
  2. Requiere más tiempo y recursos

### Recomendación

**Para fase inicial:** Opción A (Subtítulos)
- Más rápido de implementar
- Menor costo
- Fácil de actualizar
- YouTube ofrece auto-translate como backup

**Para futuro:** Opción B (Doblaje con IA)
- Una vez que la plataforma esté estable
- Para videos de mayor duración
- Mejor experiencia de usuario

---

## 🛠️ Herramientas Recomendadas

### Grabación de Pantalla
| Herramienta | Plataforma | Costo |
|------------|-----------|-------|
| Loom | Web/Desktop | Gratis hasta 5 min |
| OBS Studio | Desktop | Gratis |
| Screenflow | Mac | $169 una vez |
| Camtasia | Win/Mac | $250/año |

### Edición de Video
| Herramienta | Nivel | Costo |
|------------|-------|-------|
| CapCut | Básico | Gratis |
| DaVinci Resolve | Pro | Gratis |
| Final Cut Pro | Pro | $299 una vez |
| Adobe Premiere | Pro | $23/mes |

### Subtítulos
| Herramienta | Función | Costo |
|------------|---------|-------|
| YouTube Auto | Auto-transcripción | Gratis |
| Descript | Transcripción + Edición | $12/mes |
| Veed.io | Subtítulos + Traducción | $18/mes |

### Traducción
| Herramienta | Función | Costo |
|------------|---------|-------|
| DeepL | Traducción texto | Gratis/Pro |
| ChatGPT | Traducción + contexto | $20/mes |
| Rask AI | Doblaje automático | $60/mes |
| ElevenLabs | Voz sintética | $5-22/mes |

---

## 📅 Cronograma Sugerido

### Fase 1 - Esenciales (Semana 1-2)
- [ ] Video: Activar cuenta (enrollment)
- [ ] Video: Instalar PWA
- [ ] Video: Configuración inicial Admin
- [ ] Video: Crear invitaciones
- [ ] Subtítulos en inglés para los 4 videos

### Fase 2 - Operacionales (Semana 3-4)
- [ ] Video: Tareas y calificaciones (profesor)
- [ ] Video: Ver tareas (padre)
- [ ] Video: Pagos
- [ ] Video: Asistencia
- [ ] Subtítulos en inglés

### Fase 3 - Avanzados (Semana 5-6)
- [ ] Videos de módulos adicionales
- [ ] Imágenes de empty states
- [ ] Imágenes de onboarding

### Fase 4 - Optimización (Semana 7-8)
- [ ] Doblaje con IA para videos principales
- [ ] Videos para vocales de grupo
- [ ] Actualizaciones según feedback

---

## 📝 Notas de Producción

### Guía de Estilo para Videos
- **Duración ideal:** 1-3 minutos máximo
- **Resolución:** 1080p mínimo
- **Formato:** MP4 (H.264)
- **Audio:** Voz clara, sin música de fondo durante explicaciones
- **Música:** Solo intro/outro, instrumental suave
- **Colores:** Usar paleta de marca (#1B4079, #CBDF90)
- **Logo:** Watermark discreto en esquina

### Script Template
```
[INTRO - 5s]
"Hola, en este video aprenderás a [OBJETIVO]"

[CONTENIDO - 1-2 min]
- Paso 1: [Descripción]
- Paso 2: [Descripción]
- Paso 3: [Descripción]

[CIERRE - 5s]
"¡Listo! Si tienes dudas, usa el chat de soporte."
```

---

## ✅ Checklist Pre-Publicación

- [ ] Video grabado en 1080p
- [ ] Audio claro y sin ruido
- [ ] Subtítulos en español revisados
- [ ] Subtítulos en inglés traducidos
- [ ] Thumbnail atractivo
- [ ] Título descriptivo
- [ ] Descripción con timestamps
- [ ] Tags relevantes
- [ ] Enlace a documentación si aplica
