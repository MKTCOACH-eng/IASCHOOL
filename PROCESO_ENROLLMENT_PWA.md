# Proceso de Enrollment para PWA - IA School

## Resumen del Flujo de Registro

IA School es una **Progressive Web App (PWA)** que permite a los usuarios acceder desde cualquier dispositivo sin necesidad de descargar desde App Store o Google Play. El proceso de enrollment está diseñado para ser simple y seguro.

---

## 📱 Flujo de Enrollment por Roles

### 1. **Administradores (ADMIN)**

**Creación de cuenta:**
- El Super Admin crea la primera cuenta de administrador durante el onboarding de la escuela
- Los administradores adicionales son invitados por el administrador existente

**Proceso:**
1. Admin existente va a **Invitaciones** (`/invitations`)
2. Ingresa email y selecciona rol "Administrador"
3. Sistema genera:
   - Código de escuela (ej: `VMNT2024`)
   - Contraseña temporal (ej: `X7K9M2`)
   - Token único de invitación
4. Se envía email con link de activación
5. Nuevo admin accede al link y completa su perfil

---

### 2. **Profesores (PROFESOR)**

**Proceso:**
1. Administrador va a **Invitaciones**
2. Ingresa email del profesor y selecciona rol "Profesor"
3. Profesor recibe email con:
   - Link de activación
   - Código de escuela
   - Contraseña temporal
4. Profesor accede al link desde cualquier dispositivo
5. Completa su perfil y establece contraseña definitiva

---

### 3. **Padres de Familia (PADRE)**

**Proceso Estándar:**
1. Administrador crea invitación con email del padre
2. Padre recibe email con instrucciones
3. Padre accede al link y activa su cuenta
4. Al iniciar sesión, ve a sus hijos vinculados

**Proceso con QR (Enrollment Masivo):**
1. Administrador genera QR únicos para cada invitación
2. QR se imprime y entrega en sobre a cada familia
3. Padre escanea QR con la cámara del celular
4. Se abre automáticamente la página de enrollment
5. Padre ingresa código de escuela y contraseña temporal (incluidos en el sobre)
6. Completa su perfil

---

### 4. **Vocales de Grupo (VOCAL)**

**Proceso:**
1. Padre existente es promovido a Vocal por el administrador
2. O se crea invitación con rol Vocal directamente
3. Vocal tiene acceso a funciones adicionales de gestión de grupo

---

## 📲 ¿Cómo Funciona el QR?

### Generación del QR

El QR codifica la URL de enrollment:
```
https://[dominio]/enroll?token=[token-unico]
```

### Datos del QR
El QR **solo contiene la URL**. Los datos sensibles (código de escuela y contraseña temporal) se entregan por separado (impreso en papel, SMS, etc.).

### API de QR
```
GET /api/invitations/qr?id=[invitation-id]
```

Retorna:
```json
{
  "enrollUrl": "https://iaschool.app/enroll?token=abc123",
  "invitation": {
    "email": "padre@email.com",
    "schoolCode": "VMNT2024",
    "tempPassword": "X7K9M2",
    "expiresAt": "2026-02-14T00:00:00Z"
  }
}
```

---

## 🧪 Cómo Probar el Flujo de Enrollment

### Prerrequisitos
1. Tener acceso a la aplicación como administrador
2. Tener el servidor de desarrollo corriendo o acceso a producción

### Pasos para Probar

#### Prueba 1: Crear Invitación Manual

1. **Iniciar sesión como Admin:**
   - Email: `admin@vermont.edu.mx`
   - Password: `admin123`

2. **Ir a Invitaciones:**
   - Navegar a `/invitations`

3. **Crear Nueva Invitación:**
   - Ingresar un email de prueba (puede ser cualquiera)
   - Seleccionar rol (PADRE, PROFESOR, etc.)
   - Click en "Enviar Invitación"

4. **Copiar Datos:**
   - Anotar el código de escuela mostrado
   - Anotar la contraseña temporal
   - Copiar el link de registro

5. **Probar Enrollment:**
   - Abrir una ventana incognito
   - Pegar el link de registro
   - Ingresar código de escuela
   - Ingresar contraseña temporal
   - Completar el perfil

#### Prueba 2: Generar QR

1. **Desde Invitaciones:**
   - Localizar la invitación pendiente
   - Click en "Ver QR" (si está implementado en UI)
   - O llamar a la API: `GET /api/invitations/qr?id=[ID]`

2. **Usar el QR:**
   - Abrir cámara del celular
   - Apuntar al QR
   - Se abrirá la URL de enrollment
   - Continuar con el proceso normal

#### Prueba 3: Enrollment desde Móvil (PWA)

1. **En el celular:**
   - Abrir el link de enrollment en Safari/Chrome
   - Completar el registro

2. **Instalar PWA:**
   - En Safari (iOS): Compartir > Añadir a pantalla de inicio
   - En Chrome (Android): Menú > Instalar aplicación

3. **Verificar:**
   - Abrir la app desde el ícono en pantalla de inicio
   - Iniciar sesión con las credenciales recién creadas

---

## 🛠️ Herramientas de Testing

### Usando cURL

```bash
# Validar invitación
curl -X POST https://[dominio]/api/invitations/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"[TOKEN]","schoolCode":"VMNT2024","tempPassword":"X7K9M2"}'

# Completar registro
curl -X POST https://[dominio]/api/invitations/complete \
  -H "Content-Type: application/json" \
  -d '{"token":"[TOKEN]","name":"Juan Pérez","phone":"5512345678","newPassword":"mipassword123"}'
```

### Usando el Navegador

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Observar las llamadas a `/api/invitations/*`

---

## 📊 Estados de Invitación

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Invitación enviada, esperando activación |
| `ACCEPTED` | Usuario completó su registro |
| `EXPIRED` | Invitación venció (7 días) |

---

## 🔐 Seguridad del Proceso

1. **Token Único:** Cada invitación tiene un UUID irrepetible
2. **Contraseña Temporal:** Se genera aleatoriamente, 6 caracteres alfanuméricos
3. **Expiración:** Las invitaciones expiran en 7 días
4. **Validación Doble:** Se requiere tanto token como código de escuela + contraseña temporal
5. **HTTPS:** Toda la comunicación está encriptada

---

## 🏢 Publicación en App Stores

### Android (Google Play)
- **Tecnología:** TWA (Trusted Web Activity)
- **Costo:** $25 USD (pago único)
- **Proceso:**
  1. Crear cuenta de desarrollador en Google Play Console
  2. Usar PWA Builder (https://pwabuilder.com) para generar APK
  3. Subir APK firmado
  4. Publicar

### iOS (App Store)
- **Tecnología:** PWA Builder genera IPA
- **Costo:** $99 USD/año
- **Proceso:**
  1. Crear cuenta en Apple Developer Program
  2. Usar PWA Builder para generar proyecto iOS
  3. Configurar certificados
  4. Subir a App Store Connect
  5. Enviar a revisión

### Sin App Stores
- **Web App:** Los usuarios pueden instalar la PWA directamente desde el navegador
- **Sin costo adicional**
- **Actualizaciones instantáneas** sin pasar por revisión

---

## 📑 Checklist de Pruebas

- [ ] Crear invitación desde panel admin
- [ ] Verificar email recibido (si está configurado)
- [ ] Probar link de enrollment en navegador desktop
- [ ] Probar link de enrollment en móvil
- [ ] Validar con código y contraseña correctos
- [ ] Intentar con datos incorrectos (debe fallar)
- [ ] Completar perfil exitosamente
- [ ] Iniciar sesión con nueva cuenta
- [ ] Instalar PWA en móvil
- [ ] Verificar que notificaciones push funcionan
- [ ] Probar biometría (si está habilitada)
