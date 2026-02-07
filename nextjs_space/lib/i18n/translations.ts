// Multi-language translations for IA School
// Supported languages: Spanish (ES), English (EN), Portuguese (PT), German (DE), French (FR), Japanese (JA)

export type Language = 'es' | 'en' | 'pt' | 'de' | 'fr' | 'ja';

export const languageNames: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語'
};

export const languageFlags: Record<Language, string> = {
  es: '🇲🇽',
  en: '🇺🇸',
  pt: '🇧🇷',
  de: '🇩🇪',
  fr: '🇫🇷',
  ja: '🇯🇵'
};

const esTranslations = {
  nav: {
    home: 'Inicio', dashboard: 'Panel', messages: 'Mensajes', announcements: 'Comunicados',
    calendar: 'Calendario', tasks: 'Tareas', payments: 'Pagos', documents: 'Documentos',
    chatbot: 'Asistente IA', directory: 'Directorio', appointments: 'Citas', attendance: 'Asistencia',
    academic: 'Académico', polls: 'Encuestas', invitations: 'Invitaciones', crm: 'CRM',
    superAdmin: 'Super Admin', logout: 'Cerrar Sesión', login: 'Iniciar Sesión'
  },
  landing: {
    hero: { title: 'La Plataforma Educativa del Futuro', subtitle: 'Conectamos familias, profesores y estudiantes en un ecosistema digital seguro e inteligente.', cta: 'Comenzar Ahora' },
    features: {
      title: 'Todo lo que necesitas',
      communication: { title: 'Comunicación Instantánea', desc: 'Mensajes directos y grupales con profesores y familias.' },
      payments: { title: 'Pagos Simplificados', desc: 'Gestión de colegiaturas y pagos sin comisiones.' },
      academic: { title: 'Seguimiento Académico', desc: 'Calificaciones, tareas y asistencia en tiempo real.' },
      security: { title: 'Seguridad Total', desc: 'Firma digital y verificación de documentos.' }
    },
    forFamilies: { title: 'Para Familias', desc: 'Mantente conectado con la educación de tus hijos.' },
    forTeachers: { title: 'Para Profesores', desc: 'Herramientas digitales para potenciar tu enseñanza.' }
  },
  common: {
    loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
    create: 'Crear', search: 'Buscar', filter: 'Filtrar', export: 'Exportar', import: 'Importar',
    download: 'Descargar', upload: 'Subir', back: 'Volver', next: 'Siguiente', previous: 'Anterior',
    confirm: 'Confirmar', yes: 'Sí', no: 'No', all: 'Todos', none: 'Ninguno', select: 'Seleccionar',
    noResults: 'Sin resultados', error: 'Error', success: 'Éxito', warning: 'Advertencia', info: 'Información',
    viewAll: 'Ver todos', noData: 'Sin datos', actions: 'Acciones', status: 'Estado', date: 'Fecha',
    name: 'Nombre', email: 'Correo', phone: 'Teléfono', group: 'Grupo', student: 'Estudiante',
    teacher: 'Profesor', copy: 'Copiar', copied: 'Copiado', close: 'Cerrar', details: 'Detalles',
    settings: 'Configuración', total: 'Total', active: 'Activo', inactive: 'Inactivo',
    required: 'Requerido', optional: 'Opcional', description: 'Descripción', notes: 'Notas',
    from: 'Desde', to: 'Hasta'
  },
  dashboard: {
    welcome: 'Bienvenido', welcomeAdmin: 'Bienvenido al panel de administración. Aquí puedes gestionar los anuncios del colegio.',
    welcomeParent: 'Mantente al día con todos los anuncios importantes del colegio.',
    welcomeStudent: 'Revisa tus tareas y actividades pendientes.', welcomeTeacher: 'Gestiona tus grupos y tareas.',
    overview: 'Resumen', recentActivity: 'Actividad Reciente', pendingTasks: 'Tareas Pendientes',
    unreadMessages: 'Mensajes sin leer', upcomingEvents: 'Próximos Eventos', announcements: 'Comunicados',
    totalAnnouncements: 'Total de anuncios', registeredParents: 'Padres registrados',
    unreadAnnouncements: 'Anuncios sin leer', recentAnnouncements: 'Últimos anuncios',
    noRecentAnnouncements: 'No hay anuncios recientes.', publishAnnouncement: 'Publicar nuevo anuncio',
    adminPanel: 'Panel de Administración', stayUpdated: 'Mantente informado'
  },
  messages: {
    title: 'Mensajes', newMessage: 'Nuevo Mensaje', newConversation: 'Nueva Conversación',
    direct: 'Directos', groups: 'Grupos', typeMessage: 'Escribe un mensaje...', send: 'Enviar',
    noMessages: 'No hay mensajes', noConversations: 'No hay conversaciones', searchContacts: 'Buscar contactos',
    searchConversations: 'Buscar conversaciones', startConversation: 'Iniciar conversación',
    selectContact: 'Seleccionar contacto', mySchoolGroups: 'Mis grupos escolares', viewChat: 'Ver chat',
    createGroupChat: 'Crear chat de grupo', students: 'estudiantes', pinnedMessages: 'Mensajes fijados',
    attachFile: 'Adjuntar archivo', sendFile: 'Enviar archivo'
  },
  payments: {
    title: 'Pagos', pending: 'Pendiente', paid: 'Pagado', overdue: 'Vencido', partial: 'Parcial',
    cancelled: 'Cancelado', amount: 'Monto', amountPaid: 'Monto pagado', remaining: 'Restante',
    dueDate: 'Fecha límite', payNow: 'Pagar Ahora', history: 'Historial', speiInstructions: 'Instrucciones SPEI',
    speiConfig: 'Config. SPEI', bankInfo: 'Información bancaria', clabe: 'CLABE', reference: 'Referencia',
    copyReference: 'Copiar referencia', noCharges: 'No hay cargos pendientes', recordPayment: 'Registrar pago',
    paymentMethod: 'Método de pago', cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta',
    concept: 'Concepto', tuition: 'Colegiatura', enrollment: 'Inscripción', material: 'Material',
    uniform: 'Uniforme', event: 'Evento', transport: 'Transporte', cafeteria: 'Comedor', other: 'Otro',
    summary: 'Resumen', totalPending: 'Total pendiente', totalPaid: 'Total pagado', totalOverdue: 'Total vencido'
  },
  tasks: {
    title: 'Tareas', newTask: 'Nueva Tarea', editTask: 'Editar Tarea', dueDate: 'Fecha de entrega',
    priority: 'Prioridad', priorityHigh: 'Alta', priorityMedium: 'Media', priorityLow: 'Baja',
    status: 'Estado', completed: 'Completada', pending: 'Pendiente', inProgress: 'En progreso',
    submit: 'Entregar', submitWork: 'Entregar tarea', viewSubmissions: 'Ver entregas',
    assignedTo: 'Asignada a', assignedBy: 'Asignada por', noTasks: 'No hay tareas',
    description: 'Descripción', attachments: 'Archivos adjuntos', submission: 'Entrega',
    grade: 'Calificación', feedback: 'Retroalimentación', submitted: 'Entregada',
    notSubmitted: 'Sin entregar', late: 'Tarde', onTime: 'A tiempo'
  },
  calendar: {
    title: 'Calendario', today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día',
    newEvent: 'Nuevo Evento', editEvent: 'Editar Evento', noEvents: 'Sin eventos',
    eventTitle: 'Título del evento', eventDescription: 'Descripción del evento',
    startDate: 'Fecha de inicio', endDate: 'Fecha de fin', allDay: 'Todo el día',
    location: 'Ubicación', participants: 'Participantes'
  },
  documents: {
    title: 'Documentos', sign: 'Firmar', signed: 'Firmado', pending: 'Pendiente', verify: 'Verificar',
    download: 'Descargar', newDocument: 'Nuevo Documento', documentType: 'Tipo de documento',
    permission: 'Permiso', regulation: 'Reglamento', authorization: 'Autorización', contract: 'Contrato',
    certificate: 'Certificado', signatureRequired: 'Firma requerida', verificationCode: 'Código de verificación',
    signedAt: 'Firmado el', signedBy: 'Firmado por', noDocuments: 'No hay documentos'
  },
  chatbot: {
    title: 'Asistente IA', askQuestion: '¿En qué puedo ayudarte?', thinking: 'Pensando...',
    helpful: '¿Fue útil?', notHelpful: 'No fue útil', newConversation: 'Nueva conversación',
    conversationHistory: 'Historial de conversaciones', quickQuestions: 'Preguntas rápidas',
    rateResponse: 'Calificar respuesta', metrics: 'Métricas', totalConversations: 'Total de conversaciones',
    resolutionRate: 'Tasa de resolución', averageRating: 'Calificación promedio'
  },
  appointments: {
    title: 'Citas', schedule: 'Agendar', availableSlots: 'Horarios disponibles',
    selectTeacher: 'Seleccionar profesor', selectDate: 'Seleccionar fecha', selectTime: 'Seleccionar hora',
    confirm: 'Confirmar cita', cancel: 'Cancelar cita', reason: 'Motivo', myAppointments: 'Mis citas',
    configureAvailability: 'Configurar disponibilidad', noAvailability: 'Sin disponibilidad',
    statusPending: 'Pendiente', statusConfirmed: 'Confirmada', statusCancelled: 'Cancelada',
    statusCompleted: 'Completada', statusNoShow: 'No se presentó', confirmAppointment: 'Confirmar cita',
    completeAppointment: 'Completar cita', markNoShow: 'Marcar ausencia'
  },
  attendance: {
    title: 'Asistencia', present: 'Presente', absent: 'Ausente', late: 'Tarde', excused: 'Justificado',
    date: 'Fecha', student: 'Estudiante', takeAttendance: 'Tomar asistencia',
    attendanceHistory: 'Historial de asistencia', selectGroup: 'Seleccionar grupo',
    noStudents: 'Sin estudiantes', saveAttendance: 'Guardar asistencia', attendanceRate: 'Tasa de asistencia'
  },
  crm: {
    title: 'CRM y Comunicación', contacts: 'Contactos', campaigns: 'Campañas', templates: 'Plantillas',
    segments: 'Segmentos', newCampaign: 'Nueva Campaña', newTemplate: 'Nueva Plantilla',
    newSegment: 'Nuevo Segmento', sendEmail: 'Enviar Email', emailsSent: 'Emails enviados',
    openRate: 'Tasa de apertura', clickRate: 'Tasa de clics', campaignStatus: 'Estado de campaña',
    draft: 'Borrador', scheduled: 'Programada', sending: 'Enviando', sent: 'Enviada', failed: 'Fallida',
    recipients: 'Destinatarios', subject: 'Asunto', content: 'Contenido'
  },
  directory: {
    title: 'Directorio', students: 'Estudiantes', parents: 'Padres', staff: 'Personal',
    teachers: 'Profesores', searchPlaceholder: 'Buscar por nombre o email...',
    filterByGroup: 'Filtrar por grupo', filterByRole: 'Filtrar por rol', exportCSV: 'Exportar CSV',
    importCSV: 'Importar CSV', totalRecords: 'Total de registros', children: 'Hijos', contact: 'Contacto'
  },
  invitations: {
    title: 'Invitaciones', sendInvitation: 'Enviar invitación', pendingInvitations: 'Invitaciones pendientes',
    acceptedInvitations: 'Invitaciones aceptadas', expiredInvitations: 'Invitaciones expiradas',
    inviteUser: 'Invitar usuario', selectRole: 'Seleccionar rol', registrationLink: 'Enlace de registro',
    schoolCode: 'Código de escuela', temporaryPassword: 'Contraseña temporal', expiresIn: 'Expira en', resend: 'Reenviar'
  },
  polls: {
    title: 'Encuestas', newPoll: 'Nueva Encuesta', question: 'Pregunta', options: 'Opciones',
    addOption: 'Agregar opción', votes: 'votos', totalVotes: 'Total de votos', vote: 'Votar',
    voted: 'Votado', endDate: 'Fecha de cierre', active: 'Activa', closed: 'Cerrada', results: 'Resultados'
  },
  academic: {
    title: 'Académico', subjects: 'Materias', grades: 'Calificaciones', alerts: 'Alertas',
    reportCard: 'Boleta', average: 'Promedio', period: 'Período', semester: 'Semestre',
    finalGrade: 'Calificación final', comments: 'Comentarios', improvement: 'Necesita mejorar',
    excellent: 'Excelente', good: 'Bueno', needsImprovement: 'Necesita mejorar'
  },
  superAdmin: {
    title: 'Super Admin', schools: 'Escuelas', systemConfig: 'Configuración del sistema',
    auditLog: 'Registro de auditoría', newSchool: 'Nueva Escuela', schoolDetails: 'Detalles de escuela',
    totalSchools: 'Total de escuelas', activeSchools: 'Escuelas activas', totalUsers: 'Total de usuarios',
    systemSettings: 'Configuración del sistema', maintenanceMode: 'Modo de mantenimiento'
  },
  roles: { admin: 'Administrador', teacher: 'Profesor', parent: 'Padre/Madre', student: 'Alumno', superAdmin: 'Super Admin', vocal: 'Vocal de Grupo' },
  time: { today: 'Hoy', yesterday: 'Ayer', daysAgo: 'hace {n} días', hoursAgo: 'hace {n} horas', minutesAgo: 'hace {n} minutos', justNow: 'Justo ahora', days: 'días', hours: 'horas', minutes: 'minutos' },
  months: { january: 'Enero', february: 'Febrero', march: 'Marzo', april: 'Abril', may: 'Mayo', june: 'Junio', july: 'Julio', august: 'Agosto', september: 'Septiembre', october: 'Octubre', november: 'Noviembre', december: 'Diciembre' },
  weekdays: { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' }
};

const enTranslations = {
  nav: {
    home: 'Home', dashboard: 'Dashboard', messages: 'Messages', announcements: 'Announcements',
    calendar: 'Calendar', tasks: 'Tasks', payments: 'Payments', documents: 'Documents',
    chatbot: 'AI Assistant', directory: 'Directory', appointments: 'Appointments', attendance: 'Attendance',
    academic: 'Academic', polls: 'Polls', invitations: 'Invitations', crm: 'CRM',
    superAdmin: 'Super Admin', logout: 'Logout', login: 'Login'
  },
  landing: {
    hero: { title: 'The Educational Platform of the Future', subtitle: 'Connecting families, teachers, and students in a secure and intelligent digital ecosystem.', cta: 'Get Started' },
    features: {
      title: 'Everything You Need',
      communication: { title: 'Instant Communication', desc: 'Direct and group messages with teachers and families.' },
      payments: { title: 'Simplified Payments', desc: 'Tuition and payment management without fees.' },
      academic: { title: 'Academic Tracking', desc: 'Grades, assignments, and attendance in real-time.' },
      security: { title: 'Total Security', desc: 'Digital signatures and document verification.' }
    },
    forFamilies: { title: 'For Families', desc: 'Stay connected with your children\'s education.' },
    forTeachers: { title: 'For Teachers', desc: 'Digital tools to enhance your teaching.' }
  },
  common: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    create: 'Create', search: 'Search', filter: 'Filter', export: 'Export', import: 'Import',
    download: 'Download', upload: 'Upload', back: 'Back', next: 'Next', previous: 'Previous',
    confirm: 'Confirm', yes: 'Yes', no: 'No', all: 'All', none: 'None', select: 'Select',
    noResults: 'No results', error: 'Error', success: 'Success', warning: 'Warning', info: 'Information',
    viewAll: 'View all', noData: 'No data', actions: 'Actions', status: 'Status', date: 'Date',
    name: 'Name', email: 'Email', phone: 'Phone', group: 'Group', student: 'Student',
    teacher: 'Teacher', copy: 'Copy', copied: 'Copied', close: 'Close', details: 'Details',
    settings: 'Settings', total: 'Total', active: 'Active', inactive: 'Inactive',
    required: 'Required', optional: 'Optional', description: 'Description', notes: 'Notes',
    from: 'From', to: 'To'
  },
  dashboard: {
    welcome: 'Welcome', welcomeAdmin: 'Welcome to the admin panel. Here you can manage school announcements.',
    welcomeParent: 'Stay up to date with all important school announcements.',
    welcomeStudent: 'Check your pending tasks and activities.', welcomeTeacher: 'Manage your groups and tasks.',
    overview: 'Overview', recentActivity: 'Recent Activity', pendingTasks: 'Pending Tasks',
    unreadMessages: 'Unread Messages', upcomingEvents: 'Upcoming Events', announcements: 'Announcements',
    totalAnnouncements: 'Total announcements', registeredParents: 'Registered parents',
    unreadAnnouncements: 'Unread announcements', recentAnnouncements: 'Recent announcements',
    noRecentAnnouncements: 'No recent announcements.', publishAnnouncement: 'Publish new announcement',
    adminPanel: 'Admin Panel', stayUpdated: 'Stay informed'
  },
  messages: {
    title: 'Messages', newMessage: 'New Message', newConversation: 'New Conversation',
    direct: 'Direct', groups: 'Groups', typeMessage: 'Type a message...', send: 'Send',
    noMessages: 'No messages', noConversations: 'No conversations', searchContacts: 'Search contacts',
    searchConversations: 'Search conversations', startConversation: 'Start conversation',
    selectContact: 'Select contact', mySchoolGroups: 'My school groups', viewChat: 'View chat',
    createGroupChat: 'Create group chat', students: 'students', pinnedMessages: 'Pinned messages',
    attachFile: 'Attach file', sendFile: 'Send file'
  },
  payments: {
    title: 'Payments', pending: 'Pending', paid: 'Paid', overdue: 'Overdue', partial: 'Partial',
    cancelled: 'Cancelled', amount: 'Amount', amountPaid: 'Amount paid', remaining: 'Remaining',
    dueDate: 'Due date', payNow: 'Pay Now', history: 'History', speiInstructions: 'Wire Transfer Instructions',
    speiConfig: 'Bank Config', bankInfo: 'Bank information', clabe: 'CLABE', reference: 'Reference',
    copyReference: 'Copy reference', noCharges: 'No pending charges', recordPayment: 'Record payment',
    paymentMethod: 'Payment method', cash: 'Cash', transfer: 'Transfer', card: 'Card',
    concept: 'Concept', tuition: 'Tuition', enrollment: 'Enrollment', material: 'Material',
    uniform: 'Uniform', event: 'Event', transport: 'Transport', cafeteria: 'Cafeteria', other: 'Other',
    summary: 'Summary', totalPending: 'Total pending', totalPaid: 'Total paid', totalOverdue: 'Total overdue'
  },
  tasks: {
    title: 'Tasks', newTask: 'New Task', editTask: 'Edit Task', dueDate: 'Due date',
    priority: 'Priority', priorityHigh: 'High', priorityMedium: 'Medium', priorityLow: 'Low',
    status: 'Status', completed: 'Completed', pending: 'Pending', inProgress: 'In Progress',
    submit: 'Submit', submitWork: 'Submit work', viewSubmissions: 'View submissions',
    assignedTo: 'Assigned to', assignedBy: 'Assigned by', noTasks: 'No tasks',
    description: 'Description', attachments: 'Attachments', submission: 'Submission',
    grade: 'Grade', feedback: 'Feedback', submitted: 'Submitted',
    notSubmitted: 'Not submitted', late: 'Late', onTime: 'On time'
  },
  calendar: {
    title: 'Calendar', today: 'Today', month: 'Month', week: 'Week', day: 'Day',
    newEvent: 'New Event', editEvent: 'Edit Event', noEvents: 'No events',
    eventTitle: 'Event title', eventDescription: 'Event description',
    startDate: 'Start date', endDate: 'End date', allDay: 'All day',
    location: 'Location', participants: 'Participants'
  },
  documents: {
    title: 'Documents', sign: 'Sign', signed: 'Signed', pending: 'Pending', verify: 'Verify',
    download: 'Download', newDocument: 'New Document', documentType: 'Document type',
    permission: 'Permission', regulation: 'Regulation', authorization: 'Authorization', contract: 'Contract',
    certificate: 'Certificate', signatureRequired: 'Signature required', verificationCode: 'Verification code',
    signedAt: 'Signed at', signedBy: 'Signed by', noDocuments: 'No documents'
  },
  chatbot: {
    title: 'AI Assistant', askQuestion: 'How can I help you?', thinking: 'Thinking...',
    helpful: 'Was this helpful?', notHelpful: 'Not helpful', newConversation: 'New conversation',
    conversationHistory: 'Conversation history', quickQuestions: 'Quick questions',
    rateResponse: 'Rate response', metrics: 'Metrics', totalConversations: 'Total conversations',
    resolutionRate: 'Resolution rate', averageRating: 'Average rating'
  },
  appointments: {
    title: 'Appointments', schedule: 'Schedule', availableSlots: 'Available slots',
    selectTeacher: 'Select teacher', selectDate: 'Select date', selectTime: 'Select time',
    confirm: 'Confirm appointment', cancel: 'Cancel appointment', reason: 'Reason', myAppointments: 'My appointments',
    configureAvailability: 'Configure availability', noAvailability: 'No availability',
    statusPending: 'Pending', statusConfirmed: 'Confirmed', statusCancelled: 'Cancelled',
    statusCompleted: 'Completed', statusNoShow: 'No show', confirmAppointment: 'Confirm appointment',
    completeAppointment: 'Complete appointment', markNoShow: 'Mark no show'
  },
  attendance: {
    title: 'Attendance', present: 'Present', absent: 'Absent', late: 'Late', excused: 'Excused',
    date: 'Date', student: 'Student', takeAttendance: 'Take attendance',
    attendanceHistory: 'Attendance history', selectGroup: 'Select group',
    noStudents: 'No students', saveAttendance: 'Save attendance', attendanceRate: 'Attendance rate'
  },
  crm: {
    title: 'CRM & Communication', contacts: 'Contacts', campaigns: 'Campaigns', templates: 'Templates',
    segments: 'Segments', newCampaign: 'New Campaign', newTemplate: 'New Template',
    newSegment: 'New Segment', sendEmail: 'Send Email', emailsSent: 'Emails sent',
    openRate: 'Open rate', clickRate: 'Click rate', campaignStatus: 'Campaign status',
    draft: 'Draft', scheduled: 'Scheduled', sending: 'Sending', sent: 'Sent', failed: 'Failed',
    recipients: 'Recipients', subject: 'Subject', content: 'Content'
  },
  directory: {
    title: 'Directory', students: 'Students', parents: 'Parents', staff: 'Staff',
    teachers: 'Teachers', searchPlaceholder: 'Search by name or email...',
    filterByGroup: 'Filter by group', filterByRole: 'Filter by role', exportCSV: 'Export CSV',
    importCSV: 'Import CSV', totalRecords: 'Total records', children: 'Children', contact: 'Contact'
  },
  invitations: {
    title: 'Invitations', sendInvitation: 'Send invitation', pendingInvitations: 'Pending invitations',
    acceptedInvitations: 'Accepted invitations', expiredInvitations: 'Expired invitations',
    inviteUser: 'Invite user', selectRole: 'Select role', registrationLink: 'Registration link',
    schoolCode: 'School code', temporaryPassword: 'Temporary password', expiresIn: 'Expires in', resend: 'Resend'
  },
  polls: {
    title: 'Polls', newPoll: 'New Poll', question: 'Question', options: 'Options',
    addOption: 'Add option', votes: 'votes', totalVotes: 'Total votes', vote: 'Vote',
    voted: 'Voted', endDate: 'End date', active: 'Active', closed: 'Closed', results: 'Results'
  },
  academic: {
    title: 'Academic', subjects: 'Subjects', grades: 'Grades', alerts: 'Alerts',
    reportCard: 'Report Card', average: 'Average', period: 'Period', semester: 'Semester',
    finalGrade: 'Final grade', comments: 'Comments', improvement: 'Needs improvement',
    excellent: 'Excellent', good: 'Good', needsImprovement: 'Needs improvement'
  },
  superAdmin: {
    title: 'Super Admin', schools: 'Schools', systemConfig: 'System Configuration',
    auditLog: 'Audit Log', newSchool: 'New School', schoolDetails: 'School details',
    totalSchools: 'Total schools', activeSchools: 'Active schools', totalUsers: 'Total users',
    systemSettings: 'System settings', maintenanceMode: 'Maintenance mode'
  },
  roles: { admin: 'Administrator', teacher: 'Teacher', parent: 'Parent', student: 'Student', superAdmin: 'Super Admin', vocal: 'Group Representative' },
  time: { today: 'Today', yesterday: 'Yesterday', daysAgo: '{n} days ago', hoursAgo: '{n} hours ago', minutesAgo: '{n} minutes ago', justNow: 'Just now', days: 'days', hours: 'hours', minutes: 'minutes' },
  months: { january: 'January', february: 'February', march: 'March', april: 'April', may: 'May', june: 'June', july: 'July', august: 'August', september: 'September', october: 'October', november: 'November', december: 'December' },
  weekdays: { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' }
};

const ptTranslations = {
  nav: {
    home: 'Início', dashboard: 'Painel', messages: 'Mensagens', announcements: 'Comunicados',
    calendar: 'Calendário', tasks: 'Tarefas', payments: 'Pagamentos', documents: 'Documentos',
    chatbot: 'Assistente IA', directory: 'Diretório', appointments: 'Consultas', attendance: 'Frequência',
    academic: 'Acadêmico', polls: 'Enquetes', invitations: 'Convites', crm: 'CRM',
    superAdmin: 'Super Admin', logout: 'Sair', login: 'Entrar'
  },
  landing: {
    hero: { title: 'A Plataforma Educacional do Futuro', subtitle: 'Conectando famílias, professores e alunos em um ecossistema digital seguro e inteligente.', cta: 'Começar Agora' },
    features: {
      title: 'Tudo que Você Precisa',
      communication: { title: 'Comunicação Instantânea', desc: 'Mensagens diretas e em grupo com professores e famílias.' },
      payments: { title: 'Pagamentos Simplificados', desc: 'Gestão de mensalidades e pagamentos sem taxas.' },
      academic: { title: 'Acompanhamento Acadêmico', desc: 'Notas, tarefas e frequência em tempo real.' },
      security: { title: 'Segurança Total', desc: 'Assinatura digital e verificação de documentos.' }
    },
    forFamilies: { title: 'Para Famílias', desc: 'Mantenha-se conectado com a educação dos seus filhos.' },
    forTeachers: { title: 'Para Professores', desc: 'Ferramentas digitais para potencializar seu ensino.' }
  },
  common: {
    loading: 'Carregando...', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar',
    create: 'Criar', search: 'Buscar', filter: 'Filtrar', export: 'Exportar', import: 'Importar',
    download: 'Baixar', upload: 'Enviar', back: 'Voltar', next: 'Próximo', previous: 'Anterior',
    confirm: 'Confirmar', yes: 'Sim', no: 'Não', all: 'Todos', none: 'Nenhum', select: 'Selecionar',
    noResults: 'Sem resultados', error: 'Erro', success: 'Sucesso', warning: 'Aviso', info: 'Informação',
    viewAll: 'Ver todos', noData: 'Sem dados', actions: 'Ações', status: 'Status', date: 'Data',
    name: 'Nome', email: 'Email', phone: 'Telefone', group: 'Grupo', student: 'Aluno',
    teacher: 'Professor', copy: 'Copiar', copied: 'Copiado', close: 'Fechar', details: 'Detalhes',
    settings: 'Configurações', total: 'Total', active: 'Ativo', inactive: 'Inativo',
    required: 'Obrigatório', optional: 'Opcional', description: 'Descrição', notes: 'Notas',
    from: 'De', to: 'Até'
  },
  dashboard: {
    welcome: 'Bem-vindo', welcomeAdmin: 'Bem-vindo ao painel de administração. Aqui você pode gerenciar os comunicados da escola.',
    welcomeParent: 'Fique por dentro de todos os comunicados importantes da escola.',
    welcomeStudent: 'Confira suas tarefas e atividades pendentes.', welcomeTeacher: 'Gerencie seus grupos e tarefas.',
    overview: 'Visão Geral', recentActivity: 'Atividade Recente', pendingTasks: 'Tarefas Pendentes',
    unreadMessages: 'Mensagens não lidas', upcomingEvents: 'Próximos Eventos', announcements: 'Comunicados',
    totalAnnouncements: 'Total de comunicados', registeredParents: 'Pais registrados',
    unreadAnnouncements: 'Comunicados não lidos', recentAnnouncements: 'Comunicados recentes',
    noRecentAnnouncements: 'Não há comunicados recentes.', publishAnnouncement: 'Publicar novo comunicado',
    adminPanel: 'Painel de Administração', stayUpdated: 'Mantenha-se informado'
  },
  messages: {
    title: 'Mensagens', newMessage: 'Nova Mensagem', newConversation: 'Nova Conversa',
    direct: 'Diretas', groups: 'Grupos', typeMessage: 'Digite uma mensagem...', send: 'Enviar',
    noMessages: 'Sem mensagens', noConversations: 'Sem conversas', searchContacts: 'Buscar contatos',
    searchConversations: 'Buscar conversas', startConversation: 'Iniciar conversa',
    selectContact: 'Selecionar contato', mySchoolGroups: 'Meus grupos escolares', viewChat: 'Ver chat',
    createGroupChat: 'Criar chat em grupo', students: 'alunos', pinnedMessages: 'Mensagens fixadas',
    attachFile: 'Anexar arquivo', sendFile: 'Enviar arquivo'
  },
  payments: {
    title: 'Pagamentos', pending: 'Pendente', paid: 'Pago', overdue: 'Vencido', partial: 'Parcial',
    cancelled: 'Cancelado', amount: 'Valor', amountPaid: 'Valor pago', remaining: 'Restante',
    dueDate: 'Data de vencimento', payNow: 'Pagar Agora', history: 'Histórico', speiInstructions: 'Instruções de Transferência',
    speiConfig: 'Config. Bancária', bankInfo: 'Informações bancárias', clabe: 'Chave PIX', reference: 'Referência',
    copyReference: 'Copiar referência', noCharges: 'Sem cobranças pendentes', recordPayment: 'Registrar pagamento',
    paymentMethod: 'Método de pagamento', cash: 'Dinheiro', transfer: 'Transferência', card: 'Cartão',
    concept: 'Conceito', tuition: 'Mensalidade', enrollment: 'Matrícula', material: 'Material',
    uniform: 'Uniforme', event: 'Evento', transport: 'Transporte', cafeteria: 'Cantina', other: 'Outro',
    summary: 'Resumo', totalPending: 'Total pendente', totalPaid: 'Total pago', totalOverdue: 'Total vencido'
  },
  tasks: {
    title: 'Tarefas', newTask: 'Nova Tarefa', editTask: 'Editar Tarefa', dueDate: 'Data de entrega',
    priority: 'Prioridade', priorityHigh: 'Alta', priorityMedium: 'Média', priorityLow: 'Baixa',
    status: 'Status', completed: 'Concluída', pending: 'Pendente', inProgress: 'Em andamento',
    submit: 'Entregar', submitWork: 'Entregar tarefa', viewSubmissions: 'Ver entregas',
    assignedTo: 'Atribuída a', assignedBy: 'Atribuída por', noTasks: 'Sem tarefas',
    description: 'Descrição', attachments: 'Anexos', submission: 'Entrega',
    grade: 'Nota', feedback: 'Feedback', submitted: 'Entregue',
    notSubmitted: 'Não entregue', late: 'Atrasado', onTime: 'No prazo'
  },
  calendar: {
    title: 'Calendário', today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia',
    newEvent: 'Novo Evento', editEvent: 'Editar Evento', noEvents: 'Sem eventos',
    eventTitle: 'Título do evento', eventDescription: 'Descrição do evento',
    startDate: 'Data de início', endDate: 'Data de término', allDay: 'O dia todo',
    location: 'Local', participants: 'Participantes'
  },
  documents: {
    title: 'Documentos', sign: 'Assinar', signed: 'Assinado', pending: 'Pendente', verify: 'Verificar',
    download: 'Baixar', newDocument: 'Novo Documento', documentType: 'Tipo de documento',
    permission: 'Permissão', regulation: 'Regulamento', authorization: 'Autorização', contract: 'Contrato',
    certificate: 'Certificado', signatureRequired: 'Assinatura necessária', verificationCode: 'Código de verificação',
    signedAt: 'Assinado em', signedBy: 'Assinado por', noDocuments: 'Sem documentos'
  },
  chatbot: {
    title: 'Assistente IA', askQuestion: 'Como posso ajudar?', thinking: 'Pensando...',
    helpful: 'Foi útil?', notHelpful: 'Não foi útil', newConversation: 'Nova conversa',
    conversationHistory: 'Histórico de conversas', quickQuestions: 'Perguntas rápidas',
    rateResponse: 'Avaliar resposta', metrics: 'Métricas', totalConversations: 'Total de conversas',
    resolutionRate: 'Taxa de resolução', averageRating: 'Avaliação média'
  },
  appointments: {
    title: 'Consultas', schedule: 'Agendar', availableSlots: 'Horários disponíveis',
    selectTeacher: 'Selecionar professor', selectDate: 'Selecionar data', selectTime: 'Selecionar horário',
    confirm: 'Confirmar consulta', cancel: 'Cancelar consulta', reason: 'Motivo', myAppointments: 'Minhas consultas',
    configureAvailability: 'Configurar disponibilidade', noAvailability: 'Sem disponibilidade',
    statusPending: 'Pendente', statusConfirmed: 'Confirmada', statusCancelled: 'Cancelada',
    statusCompleted: 'Concluída', statusNoShow: 'Não compareceu', confirmAppointment: 'Confirmar consulta',
    completeAppointment: 'Concluir consulta', markNoShow: 'Marcar ausência'
  },
  attendance: {
    title: 'Frequência', present: 'Presente', absent: 'Ausente', late: 'Atrasado', excused: 'Justificado',
    date: 'Data', student: 'Aluno', takeAttendance: 'Fazer chamada',
    attendanceHistory: 'Histórico de frequência', selectGroup: 'Selecionar grupo',
    noStudents: 'Sem alunos', saveAttendance: 'Salvar frequência', attendanceRate: 'Taxa de frequência'
  },
  crm: {
    title: 'CRM e Comunicação', contacts: 'Contatos', campaigns: 'Campanhas', templates: 'Modelos',
    segments: 'Segmentos', newCampaign: 'Nova Campanha', newTemplate: 'Novo Modelo',
    newSegment: 'Novo Segmento', sendEmail: 'Enviar Email', emailsSent: 'Emails enviados',
    openRate: 'Taxa de abertura', clickRate: 'Taxa de cliques', campaignStatus: 'Status da campanha',
    draft: 'Rascunho', scheduled: 'Agendada', sending: 'Enviando', sent: 'Enviada', failed: 'Falhou',
    recipients: 'Destinatários', subject: 'Assunto', content: 'Conteúdo'
  },
  directory: {
    title: 'Diretório', students: 'Alunos', parents: 'Pais', staff: 'Funcionários',
    teachers: 'Professores', searchPlaceholder: 'Buscar por nome ou email...',
    filterByGroup: 'Filtrar por grupo', filterByRole: 'Filtrar por função', exportCSV: 'Exportar CSV',
    importCSV: 'Importar CSV', totalRecords: 'Total de registros', children: 'Filhos', contact: 'Contato'
  },
  invitations: {
    title: 'Convites', sendInvitation: 'Enviar convite', pendingInvitations: 'Convites pendentes',
    acceptedInvitations: 'Convites aceitos', expiredInvitations: 'Convites expirados',
    inviteUser: 'Convidar usuário', selectRole: 'Selecionar função', registrationLink: 'Link de registro',
    schoolCode: 'Código da escola', temporaryPassword: 'Senha temporária', expiresIn: 'Expira em', resend: 'Reenviar'
  },
  polls: {
    title: 'Enquetes', newPoll: 'Nova Enquete', question: 'Pergunta', options: 'Opções',
    addOption: 'Adicionar opção', votes: 'votos', totalVotes: 'Total de votos', vote: 'Votar',
    voted: 'Votado', endDate: 'Data de encerramento', active: 'Ativa', closed: 'Encerrada', results: 'Resultados'
  },
  academic: {
    title: 'Acadêmico', subjects: 'Matérias', grades: 'Notas', alerts: 'Alertas',
    reportCard: 'Boletim', average: 'Média', period: 'Período', semester: 'Semestre',
    finalGrade: 'Nota final', comments: 'Comentários', improvement: 'Precisa melhorar',
    excellent: 'Excelente', good: 'Bom', needsImprovement: 'Precisa melhorar'
  },
  superAdmin: {
    title: 'Super Admin', schools: 'Escolas', systemConfig: 'Configuração do Sistema',
    auditLog: 'Log de Auditoria', newSchool: 'Nova Escola', schoolDetails: 'Detalhes da escola',
    totalSchools: 'Total de escolas', activeSchools: 'Escolas ativas', totalUsers: 'Total de usuários',
    systemSettings: 'Configurações do sistema', maintenanceMode: 'Modo de manutenção'
  },
  roles: { admin: 'Administrador', teacher: 'Professor', parent: 'Pai/Mãe', student: 'Aluno', superAdmin: 'Super Admin', vocal: 'Representante de Grupo' },
  time: { today: 'Hoje', yesterday: 'Ontem', daysAgo: 'há {n} dias', hoursAgo: 'há {n} horas', minutesAgo: 'há {n} minutos', justNow: 'Agora mesmo', days: 'dias', hours: 'horas', minutes: 'minutos' },
  months: { january: 'Janeiro', february: 'Fevereiro', march: 'Março', april: 'Abril', may: 'Maio', june: 'Junho', july: 'Julho', august: 'Agosto', september: 'Setembro', october: 'Outubro', november: 'Novembro', december: 'Dezembro' },
  weekdays: { monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo' }
};

const deTranslations = {
  nav: {
    home: 'Startseite', dashboard: 'Dashboard', messages: 'Nachrichten', announcements: 'Mitteilungen',
    calendar: 'Kalender', tasks: 'Aufgaben', payments: 'Zahlungen', documents: 'Dokumente',
    chatbot: 'KI-Assistent', directory: 'Verzeichnis', appointments: 'Termine', attendance: 'Anwesenheit',
    academic: 'Akademisch', polls: 'Umfragen', invitations: 'Einladungen', crm: 'CRM',
    superAdmin: 'Super Admin', logout: 'Abmelden', login: 'Anmelden'
  },
  landing: {
    hero: { title: 'Die Bildungsplattform der Zukunft', subtitle: 'Wir verbinden Familien, Lehrer und Schüler in einem sicheren und intelligenten digitalen Ökosystem.', cta: 'Jetzt Starten' },
    features: {
      title: 'Alles was Sie brauchen',
      communication: { title: 'Sofortige Kommunikation', desc: 'Direkte und Gruppennachrichten mit Lehrern und Familien.' },
      payments: { title: 'Vereinfachte Zahlungen', desc: 'Gebühren- und Zahlungsverwaltung ohne Provisionen.' },
      academic: { title: 'Akademische Verfolgung', desc: 'Noten, Aufgaben und Anwesenheit in Echtzeit.' },
      security: { title: 'Vollständige Sicherheit', desc: 'Digitale Signaturen und Dokumentenverifizierung.' }
    },
    forFamilies: { title: 'Für Familien', desc: 'Bleiben Sie mit der Bildung Ihrer Kinder verbunden.' },
    forTeachers: { title: 'Für Lehrer', desc: 'Digitale Werkzeuge zur Verbesserung Ihres Unterrichts.' }
  },
  common: {
    loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten',
    create: 'Erstellen', search: 'Suchen', filter: 'Filtern', export: 'Exportieren', import: 'Importieren',
    download: 'Herunterladen', upload: 'Hochladen', back: 'Zurück', next: 'Weiter', previous: 'Zurück',
    confirm: 'Bestätigen', yes: 'Ja', no: 'Nein', all: 'Alle', none: 'Keine', select: 'Auswählen',
    noResults: 'Keine Ergebnisse', error: 'Fehler', success: 'Erfolg', warning: 'Warnung', info: 'Information',
    viewAll: 'Alle anzeigen', noData: 'Keine Daten', actions: 'Aktionen', status: 'Status', date: 'Datum',
    name: 'Name', email: 'E-Mail', phone: 'Telefon', group: 'Gruppe', student: 'Schüler',
    teacher: 'Lehrer', copy: 'Kopieren', copied: 'Kopiert', close: 'Schließen', details: 'Details',
    settings: 'Einstellungen', total: 'Gesamt', active: 'Aktiv', inactive: 'Inaktiv',
    required: 'Erforderlich', optional: 'Optional', description: 'Beschreibung', notes: 'Notizen',
    from: 'Von', to: 'Bis'
  },
  dashboard: {
    welcome: 'Willkommen', welcomeAdmin: 'Willkommen im Admin-Panel. Hier können Sie Schulankündigungen verwalten.',
    welcomeParent: 'Bleiben Sie über alle wichtigen Schulankündigungen informiert.',
    welcomeStudent: 'Überprüfen Sie Ihre anstehenden Aufgaben und Aktivitäten.', welcomeTeacher: 'Verwalten Sie Ihre Gruppen und Aufgaben.',
    overview: 'Übersicht', recentActivity: 'Letzte Aktivität', pendingTasks: 'Ausstehende Aufgaben',
    unreadMessages: 'Ungelesene Nachrichten', upcomingEvents: 'Kommende Ereignisse', announcements: 'Mitteilungen',
    totalAnnouncements: 'Gesamte Mitteilungen', registeredParents: 'Registrierte Eltern',
    unreadAnnouncements: 'Ungelesene Mitteilungen', recentAnnouncements: 'Aktuelle Mitteilungen',
    noRecentAnnouncements: 'Keine aktuellen Mitteilungen.', publishAnnouncement: 'Neue Mitteilung veröffentlichen',
    adminPanel: 'Admin-Panel', stayUpdated: 'Bleiben Sie informiert'
  },
  messages: {
    title: 'Nachrichten', newMessage: 'Neue Nachricht', newConversation: 'Neue Unterhaltung',
    direct: 'Direkt', groups: 'Gruppen', typeMessage: 'Nachricht eingeben...', send: 'Senden',
    noMessages: 'Keine Nachrichten', noConversations: 'Keine Unterhaltungen', searchContacts: 'Kontakte suchen',
    searchConversations: 'Unterhaltungen suchen', startConversation: 'Unterhaltung starten',
    selectContact: 'Kontakt auswählen', mySchoolGroups: 'Meine Schulgruppen', viewChat: 'Chat anzeigen',
    createGroupChat: 'Gruppenchat erstellen', students: 'Schüler', pinnedMessages: 'Angeheftete Nachrichten',
    attachFile: 'Datei anhängen', sendFile: 'Datei senden'
  },
  payments: {
    title: 'Zahlungen', pending: 'Ausstehend', paid: 'Bezahlt', overdue: 'Überfällig', partial: 'Teilweise',
    cancelled: 'Storniert', amount: 'Betrag', amountPaid: 'Bezahlter Betrag', remaining: 'Restbetrag',
    dueDate: 'Fälligkeitsdatum', payNow: 'Jetzt bezahlen', history: 'Verlauf', speiInstructions: 'Überweisungsanleitung',
    speiConfig: 'Bank-Konfiguration', bankInfo: 'Bankinformationen', clabe: 'IBAN', reference: 'Referenz',
    copyReference: 'Referenz kopieren', noCharges: 'Keine ausstehenden Gebühren', recordPayment: 'Zahlung erfassen',
    paymentMethod: 'Zahlungsmethode', cash: 'Bargeld', transfer: 'Überweisung', card: 'Karte',
    concept: 'Konzept', tuition: 'Schulgeld', enrollment: 'Einschreibung', material: 'Material',
    uniform: 'Uniform', event: 'Veranstaltung', transport: 'Transport', cafeteria: 'Cafeteria', other: 'Sonstiges',
    summary: 'Zusammenfassung', totalPending: 'Gesamt ausstehend', totalPaid: 'Gesamt bezahlt', totalOverdue: 'Gesamt überfällig'
  },
  tasks: {
    title: 'Aufgaben', newTask: 'Neue Aufgabe', editTask: 'Aufgabe bearbeiten', dueDate: 'Fälligkeitsdatum',
    priority: 'Priorität', priorityHigh: 'Hoch', priorityMedium: 'Mittel', priorityLow: 'Niedrig',
    status: 'Status', completed: 'Abgeschlossen', pending: 'Ausstehend', inProgress: 'In Bearbeitung',
    submit: 'Einreichen', submitWork: 'Arbeit einreichen', viewSubmissions: 'Einreichungen anzeigen',
    assignedTo: 'Zugewiesen an', assignedBy: 'Zugewiesen von', noTasks: 'Keine Aufgaben',
    description: 'Beschreibung', attachments: 'Anhänge', submission: 'Einreichung',
    grade: 'Note', feedback: 'Feedback', submitted: 'Eingereicht',
    notSubmitted: 'Nicht eingereicht', late: 'Verspätet', onTime: 'Pünktlich'
  },
  calendar: {
    title: 'Kalender', today: 'Heute', month: 'Monat', week: 'Woche', day: 'Tag',
    newEvent: 'Neues Ereignis', editEvent: 'Ereignis bearbeiten', noEvents: 'Keine Ereignisse',
    eventTitle: 'Ereignistitel', eventDescription: 'Ereignisbeschreibung',
    startDate: 'Startdatum', endDate: 'Enddatum', allDay: 'Ganztägig',
    location: 'Ort', participants: 'Teilnehmer'
  },
  documents: {
    title: 'Dokumente', sign: 'Unterschreiben', signed: 'Unterschrieben', pending: 'Ausstehend', verify: 'Verifizieren',
    download: 'Herunterladen', newDocument: 'Neues Dokument', documentType: 'Dokumententyp',
    permission: 'Genehmigung', regulation: 'Verordnung', authorization: 'Autorisierung', contract: 'Vertrag',
    certificate: 'Zertifikat', signatureRequired: 'Unterschrift erforderlich', verificationCode: 'Verifizierungscode',
    signedAt: 'Unterschrieben am', signedBy: 'Unterschrieben von', noDocuments: 'Keine Dokumente'
  },
  chatbot: {
    title: 'KI-Assistent', askQuestion: 'Wie kann ich helfen?', thinking: 'Denke nach...',
    helpful: 'War das hilfreich?', notHelpful: 'Nicht hilfreich', newConversation: 'Neue Unterhaltung',
    conversationHistory: 'Unterhaltungsverlauf', quickQuestions: 'Schnelle Fragen',
    rateResponse: 'Antwort bewerten', metrics: 'Metriken', totalConversations: 'Gesamte Unterhaltungen',
    resolutionRate: 'Lösungsrate', averageRating: 'Durchschnittliche Bewertung'
  },
  appointments: {
    title: 'Termine', schedule: 'Planen', availableSlots: 'Verfügbare Zeitfenster',
    selectTeacher: 'Lehrer auswählen', selectDate: 'Datum auswählen', selectTime: 'Zeit auswählen',
    confirm: 'Termin bestätigen', cancel: 'Termin absagen', reason: 'Grund', myAppointments: 'Meine Termine',
    configureAvailability: 'Verfügbarkeit konfigurieren', noAvailability: 'Keine Verfügbarkeit',
    statusPending: 'Ausstehend', statusConfirmed: 'Bestätigt', statusCancelled: 'Abgesagt',
    statusCompleted: 'Abgeschlossen', statusNoShow: 'Nicht erschienen', confirmAppointment: 'Termin bestätigen',
    completeAppointment: 'Termin abschließen', markNoShow: 'Als nicht erschienen markieren'
  },
  attendance: {
    title: 'Anwesenheit', present: 'Anwesend', absent: 'Abwesend', late: 'Verspätet', excused: 'Entschuldigt',
    date: 'Datum', student: 'Schüler', takeAttendance: 'Anwesenheit erfassen',
    attendanceHistory: 'Anwesenheitsverlauf', selectGroup: 'Gruppe auswählen',
    noStudents: 'Keine Schüler', saveAttendance: 'Anwesenheit speichern', attendanceRate: 'Anwesenheitsrate'
  },
  crm: {
    title: 'CRM & Kommunikation', contacts: 'Kontakte', campaigns: 'Kampagnen', templates: 'Vorlagen',
    segments: 'Segmente', newCampaign: 'Neue Kampagne', newTemplate: 'Neue Vorlage',
    newSegment: 'Neues Segment', sendEmail: 'E-Mail senden', emailsSent: 'E-Mails gesendet',
    openRate: 'Öffnungsrate', clickRate: 'Klickrate', campaignStatus: 'Kampagnenstatus',
    draft: 'Entwurf', scheduled: 'Geplant', sending: 'Wird gesendet', sent: 'Gesendet', failed: 'Fehlgeschlagen',
    recipients: 'Empfänger', subject: 'Betreff', content: 'Inhalt'
  },
  directory: {
    title: 'Verzeichnis', students: 'Schüler', parents: 'Eltern', staff: 'Personal',
    teachers: 'Lehrer', searchPlaceholder: 'Nach Name oder E-Mail suchen...',
    filterByGroup: 'Nach Gruppe filtern', filterByRole: 'Nach Rolle filtern', exportCSV: 'CSV exportieren',
    importCSV: 'CSV importieren', totalRecords: 'Gesamteinträge', children: 'Kinder', contact: 'Kontakt'
  },
  invitations: {
    title: 'Einladungen', sendInvitation: 'Einladung senden', pendingInvitations: 'Ausstehende Einladungen',
    acceptedInvitations: 'Angenommene Einladungen', expiredInvitations: 'Abgelaufene Einladungen',
    inviteUser: 'Benutzer einladen', selectRole: 'Rolle auswählen', registrationLink: 'Registrierungslink',
    schoolCode: 'Schulcode', temporaryPassword: 'Temporäres Passwort', expiresIn: 'Läuft ab in', resend: 'Erneut senden'
  },
  polls: {
    title: 'Umfragen', newPoll: 'Neue Umfrage', question: 'Frage', options: 'Optionen',
    addOption: 'Option hinzufügen', votes: 'Stimmen', totalVotes: 'Gesamtstimmen', vote: 'Abstimmen',
    voted: 'Abgestimmt', endDate: 'Enddatum', active: 'Aktiv', closed: 'Geschlossen', results: 'Ergebnisse'
  },
  academic: {
    title: 'Akademisch', subjects: 'Fächer', grades: 'Noten', alerts: 'Warnungen',
    reportCard: 'Zeugnis', average: 'Durchschnitt', period: 'Zeitraum', semester: 'Semester',
    finalGrade: 'Endnote', comments: 'Kommentare', improvement: 'Verbesserungsbedarf',
    excellent: 'Ausgezeichnet', good: 'Gut', needsImprovement: 'Verbesserungsbedarf'
  },
  superAdmin: {
    title: 'Super Admin', schools: 'Schulen', systemConfig: 'Systemkonfiguration',
    auditLog: 'Prüfprotokoll', newSchool: 'Neue Schule', schoolDetails: 'Schuldetails',
    totalSchools: 'Gesamte Schulen', activeSchools: 'Aktive Schulen', totalUsers: 'Gesamte Benutzer',
    systemSettings: 'Systemeinstellungen', maintenanceMode: 'Wartungsmodus'
  },
  roles: { admin: 'Administrator', teacher: 'Lehrer', parent: 'Elternteil', student: 'Schüler', superAdmin: 'Super Admin', vocal: 'Gruppenvertreter' },
  time: { today: 'Heute', yesterday: 'Gestern', daysAgo: 'vor {n} Tagen', hoursAgo: 'vor {n} Stunden', minutesAgo: 'vor {n} Minuten', justNow: 'Gerade eben', days: 'Tage', hours: 'Stunden', minutes: 'Minuten' },
  months: { january: 'Januar', february: 'Februar', march: 'März', april: 'April', may: 'Mai', june: 'Juni', july: 'Juli', august: 'August', september: 'September', october: 'Oktober', november: 'November', december: 'Dezember' },
  weekdays: { monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch', thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag', sunday: 'Sonntag' }
};

const frTranslations = {
  nav: {
    home: 'Accueil', dashboard: 'Tableau de bord', messages: 'Messages', announcements: 'Annonces',
    calendar: 'Calendrier', tasks: 'Tâches', payments: 'Paiements', documents: 'Documents',
    chatbot: 'Assistant IA', directory: 'Annuaire', appointments: 'Rendez-vous', attendance: 'Présence',
    academic: 'Académique', polls: 'Sondages', invitations: 'Invitations', crm: 'CRM',
    superAdmin: 'Super Admin', logout: 'Déconnexion', login: 'Connexion'
  },
  landing: {
    hero: { title: 'La Plateforme Éducative du Futur', subtitle: 'Nous connectons les familles, les enseignants et les étudiants dans un écosystème numérique sécurisé et intelligent.', cta: 'Commencer' },
    features: {
      title: 'Tout ce dont vous avez besoin',
      communication: { title: 'Communication Instantanée', desc: 'Messages directs et de groupe avec les enseignants et les familles.' },
      payments: { title: 'Paiements Simplifiés', desc: 'Gestion des frais de scolarité sans commissions.' },
      academic: { title: 'Suivi Académique', desc: 'Notes, devoirs et présence en temps réel.' },
      security: { title: 'Sécurité Totale', desc: 'Signatures numériques et vérification des documents.' }
    },
    forFamilies: { title: 'Pour les Familles', desc: 'Restez connecté à l\'éducation de vos enfants.' },
    forTeachers: { title: 'Pour les Enseignants', desc: 'Outils numériques pour améliorer votre enseignement.' }
  },
  common: {
    loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
    create: 'Créer', search: 'Rechercher', filter: 'Filtrer', export: 'Exporter', import: 'Importer',
    download: 'Télécharger', upload: 'Téléverser', back: 'Retour', next: 'Suivant', previous: 'Précédent',
    confirm: 'Confirmer', yes: 'Oui', no: 'Non', all: 'Tous', none: 'Aucun', select: 'Sélectionner',
    noResults: 'Aucun résultat', error: 'Erreur', success: 'Succès', warning: 'Avertissement', info: 'Information',
    viewAll: 'Voir tout', noData: 'Aucune donnée', actions: 'Actions', status: 'Statut', date: 'Date',
    name: 'Nom', email: 'Email', phone: 'Téléphone', group: 'Groupe', student: 'Élève',
    teacher: 'Enseignant', copy: 'Copier', copied: 'Copié', close: 'Fermer', details: 'Détails',
    settings: 'Paramètres', total: 'Total', active: 'Actif', inactive: 'Inactif',
    required: 'Requis', optional: 'Optionnel', description: 'Description', notes: 'Notes',
    from: 'De', to: 'À'
  },
  dashboard: {
    welcome: 'Bienvenue', welcomeAdmin: 'Bienvenue dans le panneau d\'administration. Ici vous pouvez gérer les annonces de l\'école.',
    welcomeParent: 'Restez informé de toutes les annonces importantes de l\'école.',
    welcomeStudent: 'Consultez vos tâches et activités en attente.', welcomeTeacher: 'Gérez vos groupes et tâches.',
    overview: 'Aperçu', recentActivity: 'Activité Récente', pendingTasks: 'Tâches en Attente',
    unreadMessages: 'Messages non lus', upcomingEvents: 'Événements à Venir', announcements: 'Annonces',
    totalAnnouncements: 'Total des annonces', registeredParents: 'Parents inscrits',
    unreadAnnouncements: 'Annonces non lues', recentAnnouncements: 'Annonces récentes',
    noRecentAnnouncements: 'Aucune annonce récente.', publishAnnouncement: 'Publier une nouvelle annonce',
    adminPanel: 'Panneau d\'Administration', stayUpdated: 'Restez informé'
  },
  messages: {
    title: 'Messages', newMessage: 'Nouveau Message', newConversation: 'Nouvelle Conversation',
    direct: 'Directs', groups: 'Groupes', typeMessage: 'Écrivez un message...', send: 'Envoyer',
    noMessages: 'Aucun message', noConversations: 'Aucune conversation', searchContacts: 'Rechercher des contacts',
    searchConversations: 'Rechercher des conversations', startConversation: 'Démarrer une conversation',
    selectContact: 'Sélectionner un contact', mySchoolGroups: 'Mes groupes scolaires', viewChat: 'Voir le chat',
    createGroupChat: 'Créer un chat de groupe', students: 'élèves', pinnedMessages: 'Messages épinglés',
    attachFile: 'Joindre un fichier', sendFile: 'Envoyer un fichier'
  },
  payments: {
    title: 'Paiements', pending: 'En attente', paid: 'Payé', overdue: 'En retard', partial: 'Partiel',
    cancelled: 'Annulé', amount: 'Montant', amountPaid: 'Montant payé', remaining: 'Restant',
    dueDate: 'Date d\'échéance', payNow: 'Payer Maintenant', history: 'Historique', speiInstructions: 'Instructions de Virement',
    speiConfig: 'Config. Bancaire', bankInfo: 'Informations bancaires', clabe: 'IBAN', reference: 'Référence',
    copyReference: 'Copier la référence', noCharges: 'Aucun frais en attente', recordPayment: 'Enregistrer un paiement',
    paymentMethod: 'Méthode de paiement', cash: 'Espèces', transfer: 'Virement', card: 'Carte',
    concept: 'Concept', tuition: 'Frais de scolarité', enrollment: 'Inscription', material: 'Matériel',
    uniform: 'Uniforme', event: 'Événement', transport: 'Transport', cafeteria: 'Cantine', other: 'Autre',
    summary: 'Résumé', totalPending: 'Total en attente', totalPaid: 'Total payé', totalOverdue: 'Total en retard'
  },
  tasks: {
    title: 'Tâches', newTask: 'Nouvelle Tâche', editTask: 'Modifier la Tâche', dueDate: 'Date limite',
    priority: 'Priorité', priorityHigh: 'Haute', priorityMedium: 'Moyenne', priorityLow: 'Basse',
    status: 'Statut', completed: 'Terminée', pending: 'En attente', inProgress: 'En cours',
    submit: 'Soumettre', submitWork: 'Soumettre le travail', viewSubmissions: 'Voir les soumissions',
    assignedTo: 'Assignée à', assignedBy: 'Assignée par', noTasks: 'Aucune tâche',
    description: 'Description', attachments: 'Pièces jointes', submission: 'Soumission',
    grade: 'Note', feedback: 'Commentaires', submitted: 'Soumis',
    notSubmitted: 'Non soumis', late: 'En retard', onTime: 'À temps'
  },
  calendar: {
    title: 'Calendrier', today: 'Aujourd\'hui', month: 'Mois', week: 'Semaine', day: 'Jour',
    newEvent: 'Nouvel Événement', editEvent: 'Modifier l\'Événement', noEvents: 'Aucun événement',
    eventTitle: 'Titre de l\'événement', eventDescription: 'Description de l\'événement',
    startDate: 'Date de début', endDate: 'Date de fin', allDay: 'Toute la journée',
    location: 'Lieu', participants: 'Participants'
  },
  documents: {
    title: 'Documents', sign: 'Signer', signed: 'Signé', pending: 'En attente', verify: 'Vérifier',
    download: 'Télécharger', newDocument: 'Nouveau Document', documentType: 'Type de document',
    permission: 'Permission', regulation: 'Règlement', authorization: 'Autorisation', contract: 'Contrat',
    certificate: 'Certificat', signatureRequired: 'Signature requise', verificationCode: 'Code de vérification',
    signedAt: 'Signé le', signedBy: 'Signé par', noDocuments: 'Aucun document'
  },
  chatbot: {
    title: 'Assistant IA', askQuestion: 'Comment puis-je vous aider?', thinking: 'Réflexion...',
    helpful: 'Était-ce utile?', notHelpful: 'Pas utile', newConversation: 'Nouvelle conversation',
    conversationHistory: 'Historique des conversations', quickQuestions: 'Questions rapides',
    rateResponse: 'Évaluer la réponse', metrics: 'Métriques', totalConversations: 'Total des conversations',
    resolutionRate: 'Taux de résolution', averageRating: 'Note moyenne'
  },
  appointments: {
    title: 'Rendez-vous', schedule: 'Planifier', availableSlots: 'Créneaux disponibles',
    selectTeacher: 'Sélectionner un enseignant', selectDate: 'Sélectionner une date', selectTime: 'Sélectionner l\'heure',
    confirm: 'Confirmer le rendez-vous', cancel: 'Annuler le rendez-vous', reason: 'Raison', myAppointments: 'Mes rendez-vous',
    configureAvailability: 'Configurer la disponibilité', noAvailability: 'Aucune disponibilité',
    statusPending: 'En attente', statusConfirmed: 'Confirmé', statusCancelled: 'Annulé',
    statusCompleted: 'Terminé', statusNoShow: 'Absent', confirmAppointment: 'Confirmer le rendez-vous',
    completeAppointment: 'Terminer le rendez-vous', markNoShow: 'Marquer comme absent'
  },
  attendance: {
    title: 'Présence', present: 'Présent', absent: 'Absent', late: 'En retard', excused: 'Excusé',
    date: 'Date', student: 'Élève', takeAttendance: 'Faire l\'appel',
    attendanceHistory: 'Historique de présence', selectGroup: 'Sélectionner un groupe',
    noStudents: 'Aucun élève', saveAttendance: 'Enregistrer la présence', attendanceRate: 'Taux de présence'
  },
  crm: {
    title: 'CRM & Communication', contacts: 'Contacts', campaigns: 'Campagnes', templates: 'Modèles',
    segments: 'Segments', newCampaign: 'Nouvelle Campagne', newTemplate: 'Nouveau Modèle',
    newSegment: 'Nouveau Segment', sendEmail: 'Envoyer un Email', emailsSent: 'Emails envoyés',
    openRate: 'Taux d\'ouverture', clickRate: 'Taux de clics', campaignStatus: 'Statut de la campagne',
    draft: 'Brouillon', scheduled: 'Planifiée', sending: 'Envoi en cours', sent: 'Envoyée', failed: 'Échec',
    recipients: 'Destinataires', subject: 'Sujet', content: 'Contenu'
  },
  directory: {
    title: 'Annuaire', students: 'Élèves', parents: 'Parents', staff: 'Personnel',
    teachers: 'Enseignants', searchPlaceholder: 'Rechercher par nom ou email...',
    filterByGroup: 'Filtrer par groupe', filterByRole: 'Filtrer par rôle', exportCSV: 'Exporter CSV',
    importCSV: 'Importer CSV', totalRecords: 'Total des entrées', children: 'Enfants', contact: 'Contact'
  },
  invitations: {
    title: 'Invitations', sendInvitation: 'Envoyer une invitation', pendingInvitations: 'Invitations en attente',
    acceptedInvitations: 'Invitations acceptées', expiredInvitations: 'Invitations expirées',
    inviteUser: 'Inviter un utilisateur', selectRole: 'Sélectionner un rôle', registrationLink: 'Lien d\'inscription',
    schoolCode: 'Code de l\'école', temporaryPassword: 'Mot de passe temporaire', expiresIn: 'Expire dans', resend: 'Renvoyer'
  },
  polls: {
    title: 'Sondages', newPoll: 'Nouveau Sondage', question: 'Question', options: 'Options',
    addOption: 'Ajouter une option', votes: 'votes', totalVotes: 'Total des votes', vote: 'Voter',
    voted: 'Voté', endDate: 'Date de fin', active: 'Actif', closed: 'Fermé', results: 'Résultats'
  },
  academic: {
    title: 'Académique', subjects: 'Matières', grades: 'Notes', alerts: 'Alertes',
    reportCard: 'Bulletin', average: 'Moyenne', period: 'Période', semester: 'Semestre',
    finalGrade: 'Note finale', comments: 'Commentaires', improvement: 'À améliorer',
    excellent: 'Excellent', good: 'Bien', needsImprovement: 'À améliorer'
  },
  superAdmin: {
    title: 'Super Admin', schools: 'Écoles', systemConfig: 'Configuration Système',
    auditLog: 'Journal d\'Audit', newSchool: 'Nouvelle École', schoolDetails: 'Détails de l\'école',
    totalSchools: 'Total des écoles', activeSchools: 'Écoles actives', totalUsers: 'Total des utilisateurs',
    systemSettings: 'Paramètres système', maintenanceMode: 'Mode maintenance'
  },
  roles: { admin: 'Administrateur', teacher: 'Enseignant', parent: 'Parent', student: 'Élève', superAdmin: 'Super Admin', vocal: 'Délégué de Groupe' },
  time: { today: 'Aujourd\'hui', yesterday: 'Hier', daysAgo: 'il y a {n} jours', hoursAgo: 'il y a {n} heures', minutesAgo: 'il y a {n} minutes', justNow: 'À l\'instant', days: 'jours', hours: 'heures', minutes: 'minutes' },
  months: { january: 'Janvier', february: 'Février', march: 'Mars', april: 'Avril', may: 'Mai', june: 'Juin', july: 'Juillet', august: 'Août', september: 'Septembre', october: 'Octobre', november: 'Novembre', december: 'Décembre' },
  weekdays: { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche' }
};

const jaTranslations = {
  nav: {
    home: 'ホーム', dashboard: 'ダッシュボード', messages: 'メッセージ', announcements: 'お知らせ',
    calendar: 'カレンダー', tasks: '課題', payments: '支払い', documents: '書類',
    chatbot: 'AIアシスタント', directory: 'ディレクトリ', appointments: '予約', attendance: '出席',
    academic: '学業', polls: 'アンケート', invitations: '招待', crm: 'CRM',
    superAdmin: 'スーパー管理者', logout: 'ログアウト', login: 'ログイン'
  },
  landing: {
    hero: { title: '未来の教育プラットフォーム', subtitle: '安全でインテリジェントなデジタルエコシステムで、家族、教師、生徒をつなぎます。', cta: '今すぐ始める' },
    features: {
      title: '必要なものすべて',
      communication: { title: 'インスタントコミュニケーション', desc: '教師や家族との直接メッセージとグループメッセージ。' },
      payments: { title: '簡単な支払い', desc: '手数料なしの授業料と支払い管理。' },
      academic: { title: '学業追跡', desc: 'リアルタイムの成績、課題、出席。' },
      security: { title: '完全なセキュリティ', desc: 'デジタル署名と書類検証。' }
    },
    forFamilies: { title: 'ご家族向け', desc: 'お子様の教育とつながりましょう。' },
    forTeachers: { title: '教師向け', desc: '教育を強化するデジタルツール。' }
  },
  common: {
    loading: '読み込み中...', save: '保存', cancel: 'キャンセル', delete: '削除', edit: '編集',
    create: '作成', search: '検索', filter: 'フィルター', export: 'エクスポート', import: 'インポート',
    download: 'ダウンロード', upload: 'アップロード', back: '戻る', next: '次へ', previous: '前へ',
    confirm: '確認', yes: 'はい', no: 'いいえ', all: 'すべて', none: 'なし', select: '選択',
    noResults: '結果なし', error: 'エラー', success: '成功', warning: '警告', info: '情報',
    viewAll: 'すべて見る', noData: 'データなし', actions: 'アクション', status: 'ステータス', date: '日付',
    name: '名前', email: 'メール', phone: '電話', group: 'グループ', student: '生徒',
    teacher: '教師', copy: 'コピー', copied: 'コピー済み', close: '閉じる', details: '詳細',
    settings: '設定', total: '合計', active: 'アクティブ', inactive: '非アクティブ',
    required: '必須', optional: '任意', description: '説明', notes: 'メモ',
    from: 'から', to: 'まで'
  },
  dashboard: {
    welcome: 'ようこそ', welcomeAdmin: '管理パネルへようこそ。ここで学校のお知らせを管理できます。',
    welcomeParent: '学校の重要なお知らせをすべてチェックしましょう。',
    welcomeStudent: '保留中の課題とアクティビティを確認してください。', welcomeTeacher: 'グループと課題を管理してください。',
    overview: '概要', recentActivity: '最近のアクティビティ', pendingTasks: '保留中の課題',
    unreadMessages: '未読メッセージ', upcomingEvents: '今後のイベント', announcements: 'お知らせ',
    totalAnnouncements: 'お知らせ総数', registeredParents: '登録済み保護者',
    unreadAnnouncements: '未読のお知らせ', recentAnnouncements: '最近のお知らせ',
    noRecentAnnouncements: '最近のお知らせはありません。', publishAnnouncement: '新しいお知らせを投稿',
    adminPanel: '管理パネル', stayUpdated: '最新情報をチェック'
  },
  messages: {
    title: 'メッセージ', newMessage: '新しいメッセージ', newConversation: '新しい会話',
    direct: 'ダイレクト', groups: 'グループ', typeMessage: 'メッセージを入力...', send: '送信',
    noMessages: 'メッセージなし', noConversations: '会話なし', searchContacts: '連絡先を検索',
    searchConversations: '会話を検索', startConversation: '会話を開始',
    selectContact: '連絡先を選択', mySchoolGroups: '私の学校グループ', viewChat: 'チャットを見る',
    createGroupChat: 'グループチャットを作成', students: '生徒', pinnedMessages: 'ピン留めメッセージ',
    attachFile: 'ファイルを添付', sendFile: 'ファイルを送信'
  },
  payments: {
    title: '支払い', pending: '未払い', paid: '支払済み', overdue: '期限切れ', partial: '一部支払い',
    cancelled: 'キャンセル', amount: '金額', amountPaid: '支払い済み金額', remaining: '残額',
    dueDate: '期限', payNow: '今すぐ支払う', history: '履歴', speiInstructions: '振込手順',
    speiConfig: '銀行設定', bankInfo: '銀行情報', clabe: '口座番号', reference: '参照番号',
    copyReference: '参照番号をコピー', noCharges: '未払いの請求はありません', recordPayment: '支払いを記録',
    paymentMethod: '支払い方法', cash: '現金', transfer: '振込', card: 'カード',
    concept: '内容', tuition: '授業料', enrollment: '入学金', material: '教材費',
    uniform: '制服', event: 'イベント', transport: '交通費', cafeteria: '食堂', other: 'その他',
    summary: '概要', totalPending: '未払い総額', totalPaid: '支払い済み総額', totalOverdue: '期限切れ総額'
  },
  tasks: {
    title: '課題', newTask: '新しい課題', editTask: '課題を編集', dueDate: '締め切り',
    priority: '優先度', priorityHigh: '高', priorityMedium: '中', priorityLow: '低',
    status: 'ステータス', completed: '完了', pending: '保留中', inProgress: '進行中',
    submit: '提出', submitWork: '課題を提出', viewSubmissions: '提出物を見る',
    assignedTo: '割り当て先', assignedBy: '割り当て元', noTasks: '課題なし',
    description: '説明', attachments: '添付ファイル', submission: '提出物',
    grade: '成績', feedback: 'フィードバック', submitted: '提出済み',
    notSubmitted: '未提出', late: '遅刻', onTime: '時間通り'
  },
  calendar: {
    title: 'カレンダー', today: '今日', month: '月', week: '週', day: '日',
    newEvent: '新しいイベント', editEvent: 'イベントを編集', noEvents: 'イベントなし',
    eventTitle: 'イベントタイトル', eventDescription: 'イベントの説明',
    startDate: '開始日', endDate: '終了日', allDay: '終日',
    location: '場所', participants: '参加者'
  },
  documents: {
    title: '書類', sign: '署名', signed: '署名済み', pending: '保留中', verify: '検証',
    download: 'ダウンロード', newDocument: '新しい書類', documentType: '書類の種類',
    permission: '許可', regulation: '規則', authorization: '承認', contract: '契約',
    certificate: '証明書', signatureRequired: '署名が必要', verificationCode: '検証コード',
    signedAt: '署名日', signedBy: '署名者', noDocuments: '書類なし'
  },
  chatbot: {
    title: 'AIアシスタント', askQuestion: 'ご用件は？', thinking: '考え中...',
    helpful: '役に立ちましたか？', notHelpful: '役に立たなかった', newConversation: '新しい会話',
    conversationHistory: '会話履歴', quickQuestions: 'クイック質問',
    rateResponse: '回答を評価', metrics: 'メトリクス', totalConversations: '会話総数',
    resolutionRate: '解決率', averageRating: '平均評価'
  },
  appointments: {
    title: '予約', schedule: '予約する', availableSlots: '空き時間',
    selectTeacher: '教師を選択', selectDate: '日付を選択', selectTime: '時間を選択',
    confirm: '予約を確認', cancel: '予約をキャンセル', reason: '理由', myAppointments: '私の予約',
    configureAvailability: '空き時間を設定', noAvailability: '空きなし',
    statusPending: '保留中', statusConfirmed: '確認済み', statusCancelled: 'キャンセル済み',
    statusCompleted: '完了', statusNoShow: '欠席', confirmAppointment: '予約を確認',
    completeAppointment: '予約を完了', markNoShow: '欠席としてマーク'
  },
  attendance: {
    title: '出席', present: '出席', absent: '欠席', late: '遅刻', excused: '許可済み',
    date: '日付', student: '生徒', takeAttendance: '出席を取る',
    attendanceHistory: '出席履歴', selectGroup: 'グループを選択',
    noStudents: '生徒なし', saveAttendance: '出席を保存', attendanceRate: '出席率'
  },
  crm: {
    title: 'CRM & コミュニケーション', contacts: '連絡先', campaigns: 'キャンペーン', templates: 'テンプレート',
    segments: 'セグメント', newCampaign: '新しいキャンペーン', newTemplate: '新しいテンプレート',
    newSegment: '新しいセグメント', sendEmail: 'メール送信', emailsSent: '送信済みメール',
    openRate: '開封率', clickRate: 'クリック率', campaignStatus: 'キャンペーン状況',
    draft: '下書き', scheduled: '予定', sending: '送信中', sent: '送信済み', failed: '失敗',
    recipients: '受信者', subject: '件名', content: '内容'
  },
  directory: {
    title: 'ディレクトリ', students: '生徒', parents: '保護者', staff: 'スタッフ',
    teachers: '教師', searchPlaceholder: '名前またはメールで検索...',
    filterByGroup: 'グループでフィルター', filterByRole: '役割でフィルター', exportCSV: 'CSVエクスポート',
    importCSV: 'CSVインポート', totalRecords: '総レコード', children: '子供', contact: '連絡先'
  },
  invitations: {
    title: '招待', sendInvitation: '招待を送信', pendingInvitations: '保留中の招待',
    acceptedInvitations: '承諾された招待', expiredInvitations: '期限切れの招待',
    inviteUser: 'ユーザーを招待', selectRole: '役割を選択', registrationLink: '登録リンク',
    schoolCode: '学校コード', temporaryPassword: '仮パスワード', expiresIn: '有効期限', resend: '再送信'
  },
  polls: {
    title: 'アンケート', newPoll: '新しいアンケート', question: '質問', options: 'オプション',
    addOption: 'オプションを追加', votes: '票', totalVotes: '総投票数', vote: '投票',
    voted: '投票済み', endDate: '終了日', active: 'アクティブ', closed: '終了', results: '結果'
  },
  academic: {
    title: '学業', subjects: '科目', grades: '成績', alerts: 'アラート',
    reportCard: '通知表', average: '平均', period: '期間', semester: '学期',
    finalGrade: '最終成績', comments: 'コメント', improvement: '改善が必要',
    excellent: '優秀', good: '良好', needsImprovement: '改善が必要'
  },
  superAdmin: {
    title: 'スーパー管理者', schools: '学校', systemConfig: 'システム設定',
    auditLog: '監査ログ', newSchool: '新しい学校', schoolDetails: '学校詳細',
    totalSchools: '学校総数', activeSchools: 'アクティブな学校', totalUsers: 'ユーザー総数',
    systemSettings: 'システム設定', maintenanceMode: 'メンテナンスモード'
  },
  roles: { admin: '管理者', teacher: '教師', parent: '保護者', student: '生徒', superAdmin: 'スーパー管理者', vocal: 'グループ代表' },
  time: { today: '今日', yesterday: '昨日', daysAgo: '{n}日前', hoursAgo: '{n}時間前', minutesAgo: '{n}分前', justNow: 'たった今', days: '日', hours: '時間', minutes: '分' },
  months: { january: '1月', february: '2月', march: '3月', april: '4月', may: '5月', june: '6月', july: '7月', august: '8月', september: '9月', october: '10月', november: '11月', december: '12月' },
  weekdays: { monday: '月曜日', tuesday: '火曜日', wednesday: '水曜日', thursday: '木曜日', friday: '金曜日', saturday: '土曜日', sunday: '日曜日' }
};

export const translations = {
  es: esTranslations,
  en: enTranslations,
  pt: ptTranslations,
  de: deTranslations,
  fr: frTranslations,
  ja: jaTranslations
};

export type TranslationKeys = typeof esTranslations;

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang] || translations.es;
}
