export type Language = 'ES' | 'EN' | 'PT' | 'DE' | 'FR' | 'JA';

export const languageNames: Record<Language, string> = {
  ES: 'Español',
  EN: 'English',
  PT: 'Português',
  DE: 'Deutsch',
  FR: 'Français',
  JA: '日本語'
};

export const languageFlags: Record<Language, string> = {
  ES: '🇲🇽',
  EN: '🇺🇸',
  PT: '🇧🇷',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JA: '🇯🇵'
};

export type TranslationKey = keyof typeof translations.ES;

export const translations = {
  ES: {
    // General
    'app.name': 'IA School',
    'app.loading': 'Cargando...',
    'app.error': 'Error',
    'app.success': 'Éxito',
    'app.save': 'Guardar',
    'app.cancel': 'Cancelar',
    'app.delete': 'Eliminar',
    'app.edit': 'Editar',
    'app.create': 'Crear',
    'app.search': 'Buscar',
    'app.filter': 'Filtrar',
    'app.export': 'Exportar',
    'app.import': 'Importar',
    'app.back': 'Volver',
    'app.next': 'Siguiente',
    'app.previous': 'Anterior',
    'app.confirm': 'Confirmar',
    'app.close': 'Cerrar',
    'app.yes': 'Sí',
    'app.no': 'No',
    'app.all': 'Todos',
    'app.none': 'Ninguno',
    'app.view': 'Ver',
    'app.download': 'Descargar',
    'app.upload': 'Subir',
    'app.send': 'Enviar',
    'app.copy': 'Copiar',
    'app.copied': 'Copiado',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.logout': 'Cerrar Sesión',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',
    'auth.login_error': 'Credenciales incorrectas',
    'auth.welcome_back': 'Bienvenido de nuevo',
    
    // Navigation
    'nav.dashboard': 'Inicio',
    'nav.announcements': 'Anuncios',
    'nav.messages': 'Mensajes',
    'nav.calendar': 'Calendario',
    'nav.tasks': 'Tareas',
    'nav.attendance': 'Asistencia',
    'nav.grades': 'Calificaciones',
    'nav.payments': 'Pagos',
    'nav.documents': 'Documentos',
    'nav.polls': 'Encuestas',
    'nav.appointments': 'Citas',
    'nav.chatbot': 'Asistente IA',
    'nav.directory': 'Directorio',
    'nav.settings': 'Configuración',
    'nav.invitations': 'Invitaciones',
    'nav.crm': 'CRM',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido',
    'dashboard.pending_tasks': 'Tareas pendientes',
    'dashboard.upcoming_events': 'Próximos eventos',
    'dashboard.recent_announcements': 'Anuncios recientes',
    'dashboard.unread_messages': 'Mensajes sin leer',
    'dashboard.pending_payments': 'Pagos pendientes',
    'dashboard.today_attendance': 'Asistencia de hoy',
    
    // Announcements
    'announcements.title': 'Anuncios',
    'announcements.new': 'Nuevo anuncio',
    'announcements.no_announcements': 'No hay anuncios',
    'announcements.mark_read': 'Marcar como leído',
    'announcements.urgent': 'Urgente',
    'announcements.normal': 'Normal',
    
    // Messages
    'messages.title': 'Mensajes',
    'messages.new_conversation': 'Nueva conversación',
    'messages.no_messages': 'No hay mensajes',
    'messages.type_message': 'Escribe un mensaje...',
    'messages.send': 'Enviar',
    'messages.direct': 'Directos',
    'messages.groups': 'Grupos',
    
    // Tasks
    'tasks.title': 'Tareas',
    'tasks.new_task': 'Nueva tarea',
    'tasks.no_tasks': 'No hay tareas',
    'tasks.due_date': 'Fecha de entrega',
    'tasks.submit': 'Entregar',
    'tasks.submitted': 'Entregada',
    'tasks.pending': 'Pendiente',
    'tasks.graded': 'Calificada',
    
    // Attendance
    'attendance.title': 'Asistencia',
    'attendance.present': 'Presente',
    'attendance.absent': 'Ausente',
    'attendance.late': 'Tardanza',
    'attendance.justified': 'Justificado',
    'attendance.take_attendance': 'Tomar asistencia',
    
    // Grades
    'grades.title': 'Calificaciones',
    'grades.average': 'Promedio',
    'grades.subject': 'Materia',
    'grades.grade': 'Calificación',
    'grades.date': 'Fecha',
    
    // Payments
    'payments.title': 'Pagos',
    'payments.pending': 'Pendientes',
    'payments.paid': 'Pagados',
    'payments.amount': 'Monto',
    'payments.due_date': 'Fecha de vencimiento',
    'payments.pay_now': 'Pagar ahora',
    'payments.receipt': 'Recibo',
    
    // Documents
    'documents.title': 'Documentos',
    'documents.sign': 'Firmar',
    'documents.signed': 'Firmado',
    'documents.pending_signature': 'Pendiente de firma',
    'documents.download': 'Descargar',
    
    // Appointments
    'appointments.title': 'Citas',
    'appointments.new': 'Nueva cita',
    'appointments.schedule': 'Agendar',
    'appointments.cancel': 'Cancelar cita',
    'appointments.confirm': 'Confirmar cita',
    'appointments.date': 'Fecha',
    'appointments.time': 'Hora',
    'appointments.teacher': 'Profesor',
    'appointments.parent': 'Padre/Madre',
    
    // Chatbot
    'chatbot.title': 'Asistente IA',
    'chatbot.placeholder': 'Escribe tu pregunta...',
    'chatbot.thinking': 'Pensando...',
    'chatbot.error': 'Error al procesar tu consulta',
    
    // Directory
    'directory.title': 'Directorio',
    'directory.students': 'Estudiantes',
    'directory.parents': 'Padres',
    'directory.staff': 'Personal',
    'directory.search_placeholder': 'Buscar por nombre o email...',
    
    // CRM
    'crm.title': 'CRM y Comunicación',
    'crm.segments': 'Segmentos',
    'crm.campaigns': 'Campañas',
    'crm.templates': 'Plantillas',
    'crm.new_segment': 'Nuevo segmento',
    'crm.new_campaign': 'Nueva campaña',
    'crm.recipients': 'Destinatarios',
    'crm.send_now': 'Enviar ahora',
    'crm.schedule': 'Programar',
    'crm.draft': 'Borrador',
    'crm.sent': 'Enviado',
    'crm.open_rate': 'Tasa de apertura',
    'crm.click_rate': 'Tasa de clicks',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.profile': 'Perfil',
    'settings.change_password': 'Cambiar contraseña',
    
    // Roles
    'role.admin': 'Administrador',
    'role.teacher': 'Profesor',
    'role.parent': 'Padre/Madre',
    'role.student': 'Estudiante',
    'role.vocal': 'Vocal',
    'role.super_admin': 'Super Admin',
    
    // Time
    'time.today': 'Hoy',
    'time.yesterday': 'Ayer',
    'time.tomorrow': 'Mañana',
    'time.this_week': 'Esta semana',
    'time.this_month': 'Este mes',
    
    // Status
    'status.active': 'Activo',
    'status.inactive': 'Inactivo',
    'status.pending': 'Pendiente',
    'status.completed': 'Completado',
    'status.cancelled': 'Cancelado',
  },
  
  EN: {
    // General
    'app.name': 'IA School',
    'app.loading': 'Loading...',
    'app.error': 'Error',
    'app.success': 'Success',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.create': 'Create',
    'app.search': 'Search',
    'app.filter': 'Filter',
    'app.export': 'Export',
    'app.import': 'Import',
    'app.back': 'Back',
    'app.next': 'Next',
    'app.previous': 'Previous',
    'app.confirm': 'Confirm',
    'app.close': 'Close',
    'app.yes': 'Yes',
    'app.no': 'No',
    'app.all': 'All',
    'app.none': 'None',
    'app.view': 'View',
    'app.download': 'Download',
    'app.upload': 'Upload',
    'app.send': 'Send',
    'app.copy': 'Copy',
    'app.copied': 'Copied',
    
    // Auth
    'auth.login': 'Log In',
    'auth.logout': 'Log Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot_password': 'Forgot your password?',
    'auth.login_error': 'Invalid credentials',
    'auth.welcome_back': 'Welcome back',
    
    // Navigation
    'nav.dashboard': 'Home',
    'nav.announcements': 'Announcements',
    'nav.messages': 'Messages',
    'nav.calendar': 'Calendar',
    'nav.tasks': 'Tasks',
    'nav.attendance': 'Attendance',
    'nav.grades': 'Grades',
    'nav.payments': 'Payments',
    'nav.documents': 'Documents',
    'nav.polls': 'Polls',
    'nav.appointments': 'Appointments',
    'nav.chatbot': 'AI Assistant',
    'nav.directory': 'Directory',
    'nav.settings': 'Settings',
    'nav.invitations': 'Invitations',
    'nav.crm': 'CRM',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.pending_tasks': 'Pending tasks',
    'dashboard.upcoming_events': 'Upcoming events',
    'dashboard.recent_announcements': 'Recent announcements',
    'dashboard.unread_messages': 'Unread messages',
    'dashboard.pending_payments': 'Pending payments',
    'dashboard.today_attendance': "Today's attendance",
    
    // Announcements
    'announcements.title': 'Announcements',
    'announcements.new': 'New announcement',
    'announcements.no_announcements': 'No announcements',
    'announcements.mark_read': 'Mark as read',
    'announcements.urgent': 'Urgent',
    'announcements.normal': 'Normal',
    
    // Messages
    'messages.title': 'Messages',
    'messages.new_conversation': 'New conversation',
    'messages.no_messages': 'No messages',
    'messages.type_message': 'Type a message...',
    'messages.send': 'Send',
    'messages.direct': 'Direct',
    'messages.groups': 'Groups',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.new_task': 'New task',
    'tasks.no_tasks': 'No tasks',
    'tasks.due_date': 'Due date',
    'tasks.submit': 'Submit',
    'tasks.submitted': 'Submitted',
    'tasks.pending': 'Pending',
    'tasks.graded': 'Graded',
    
    // Attendance
    'attendance.title': 'Attendance',
    'attendance.present': 'Present',
    'attendance.absent': 'Absent',
    'attendance.late': 'Late',
    'attendance.justified': 'Justified',
    'attendance.take_attendance': 'Take attendance',
    
    // Grades
    'grades.title': 'Grades',
    'grades.average': 'Average',
    'grades.subject': 'Subject',
    'grades.grade': 'Grade',
    'grades.date': 'Date',
    
    // Payments
    'payments.title': 'Payments',
    'payments.pending': 'Pending',
    'payments.paid': 'Paid',
    'payments.amount': 'Amount',
    'payments.due_date': 'Due date',
    'payments.pay_now': 'Pay now',
    'payments.receipt': 'Receipt',
    
    // Documents
    'documents.title': 'Documents',
    'documents.sign': 'Sign',
    'documents.signed': 'Signed',
    'documents.pending_signature': 'Pending signature',
    'documents.download': 'Download',
    
    // Appointments
    'appointments.title': 'Appointments',
    'appointments.new': 'New appointment',
    'appointments.schedule': 'Schedule',
    'appointments.cancel': 'Cancel appointment',
    'appointments.confirm': 'Confirm appointment',
    'appointments.date': 'Date',
    'appointments.time': 'Time',
    'appointments.teacher': 'Teacher',
    'appointments.parent': 'Parent',
    
    // Chatbot
    'chatbot.title': 'AI Assistant',
    'chatbot.placeholder': 'Type your question...',
    'chatbot.thinking': 'Thinking...',
    'chatbot.error': 'Error processing your query',
    
    // Directory
    'directory.title': 'Directory',
    'directory.students': 'Students',
    'directory.parents': 'Parents',
    'directory.staff': 'Staff',
    'directory.search_placeholder': 'Search by name or email...',
    
    // CRM
    'crm.title': 'CRM & Communication',
    'crm.segments': 'Segments',
    'crm.campaigns': 'Campaigns',
    'crm.templates': 'Templates',
    'crm.new_segment': 'New segment',
    'crm.new_campaign': 'New campaign',
    'crm.recipients': 'Recipients',
    'crm.send_now': 'Send now',
    'crm.schedule': 'Schedule',
    'crm.draft': 'Draft',
    'crm.sent': 'Sent',
    'crm.open_rate': 'Open rate',
    'crm.click_rate': 'Click rate',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.profile': 'Profile',
    'settings.change_password': 'Change password',
    
    // Roles
    'role.admin': 'Administrator',
    'role.teacher': 'Teacher',
    'role.parent': 'Parent',
    'role.student': 'Student',
    'role.vocal': 'Class Rep',
    'role.super_admin': 'Super Admin',
    
    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.tomorrow': 'Tomorrow',
    'time.this_week': 'This week',
    'time.this_month': 'This month',
    
    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
  },
  
  PT: {
    // General
    'app.name': 'IA School',
    'app.loading': 'Carregando...',
    'app.error': 'Erro',
    'app.success': 'Sucesso',
    'app.save': 'Salvar',
    'app.cancel': 'Cancelar',
    'app.delete': 'Excluir',
    'app.edit': 'Editar',
    'app.create': 'Criar',
    'app.search': 'Buscar',
    'app.filter': 'Filtrar',
    'app.export': 'Exportar',
    'app.import': 'Importar',
    'app.back': 'Voltar',
    'app.next': 'Próximo',
    'app.previous': 'Anterior',
    'app.confirm': 'Confirmar',
    'app.close': 'Fechar',
    'app.yes': 'Sim',
    'app.no': 'Não',
    'app.all': 'Todos',
    'app.none': 'Nenhum',
    'app.view': 'Ver',
    'app.download': 'Baixar',
    'app.upload': 'Enviar',
    'app.send': 'Enviar',
    'app.copy': 'Copiar',
    'app.copied': 'Copiado',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.logout': 'Sair',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.forgot_password': 'Esqueceu sua senha?',
    'auth.login_error': 'Credenciais inválidas',
    'auth.welcome_back': 'Bem-vindo de volta',
    
    // Navigation
    'nav.dashboard': 'Início',
    'nav.announcements': 'Avisos',
    'nav.messages': 'Mensagens',
    'nav.calendar': 'Calendário',
    'nav.tasks': 'Tarefas',
    'nav.attendance': 'Frequência',
    'nav.grades': 'Notas',
    'nav.payments': 'Pagamentos',
    'nav.documents': 'Documentos',
    'nav.polls': 'Enquetes',
    'nav.appointments': 'Agendamentos',
    'nav.chatbot': 'Assistente IA',
    'nav.directory': 'Diretório',
    'nav.settings': 'Configurações',
    'nav.invitations': 'Convites',
    'nav.crm': 'CRM',
    
    // Dashboard
    'dashboard.welcome': 'Bem-vindo',
    'dashboard.pending_tasks': 'Tarefas pendentes',
    'dashboard.upcoming_events': 'Próximos eventos',
    'dashboard.recent_announcements': 'Avisos recentes',
    'dashboard.unread_messages': 'Mensagens não lidas',
    'dashboard.pending_payments': 'Pagamentos pendentes',
    'dashboard.today_attendance': 'Frequência de hoje',
    
    // Announcements
    'announcements.title': 'Avisos',
    'announcements.new': 'Novo aviso',
    'announcements.no_announcements': 'Sem avisos',
    'announcements.mark_read': 'Marcar como lido',
    'announcements.urgent': 'Urgente',
    'announcements.normal': 'Normal',
    
    // Messages
    'messages.title': 'Mensagens',
    'messages.new_conversation': 'Nova conversa',
    'messages.no_messages': 'Sem mensagens',
    'messages.type_message': 'Digite uma mensagem...',
    'messages.send': 'Enviar',
    'messages.direct': 'Diretas',
    'messages.groups': 'Grupos',
    
    // Tasks
    'tasks.title': 'Tarefas',
    'tasks.new_task': 'Nova tarefa',
    'tasks.no_tasks': 'Sem tarefas',
    'tasks.due_date': 'Data de entrega',
    'tasks.submit': 'Entregar',
    'tasks.submitted': 'Entregue',
    'tasks.pending': 'Pendente',
    'tasks.graded': 'Avaliada',
    
    // Attendance
    'attendance.title': 'Frequência',
    'attendance.present': 'Presente',
    'attendance.absent': 'Ausente',
    'attendance.late': 'Atrasado',
    'attendance.justified': 'Justificado',
    'attendance.take_attendance': 'Fazer chamada',
    
    // Grades
    'grades.title': 'Notas',
    'grades.average': 'Média',
    'grades.subject': 'Matéria',
    'grades.grade': 'Nota',
    'grades.date': 'Data',
    
    // Payments
    'payments.title': 'Pagamentos',
    'payments.pending': 'Pendentes',
    'payments.paid': 'Pagos',
    'payments.amount': 'Valor',
    'payments.due_date': 'Data de vencimento',
    'payments.pay_now': 'Pagar agora',
    'payments.receipt': 'Recibo',
    
    // Documents
    'documents.title': 'Documentos',
    'documents.sign': 'Assinar',
    'documents.signed': 'Assinado',
    'documents.pending_signature': 'Aguardando assinatura',
    'documents.download': 'Baixar',
    
    // Appointments
    'appointments.title': 'Agendamentos',
    'appointments.new': 'Novo agendamento',
    'appointments.schedule': 'Agendar',
    'appointments.cancel': 'Cancelar agendamento',
    'appointments.confirm': 'Confirmar agendamento',
    'appointments.date': 'Data',
    'appointments.time': 'Hora',
    'appointments.teacher': 'Professor',
    'appointments.parent': 'Responsável',
    
    // Chatbot
    'chatbot.title': 'Assistente IA',
    'chatbot.placeholder': 'Digite sua pergunta...',
    'chatbot.thinking': 'Pensando...',
    'chatbot.error': 'Erro ao processar sua consulta',
    
    // Directory
    'directory.title': 'Diretório',
    'directory.students': 'Alunos',
    'directory.parents': 'Responsáveis',
    'directory.staff': 'Equipe',
    'directory.search_placeholder': 'Buscar por nome ou e-mail...',
    
    // CRM
    'crm.title': 'CRM e Comunicação',
    'crm.segments': 'Segmentos',
    'crm.campaigns': 'Campanhas',
    'crm.templates': 'Modelos',
    'crm.new_segment': 'Novo segmento',
    'crm.new_campaign': 'Nova campanha',
    'crm.recipients': 'Destinatários',
    'crm.send_now': 'Enviar agora',
    'crm.schedule': 'Programar',
    'crm.draft': 'Rascunho',
    'crm.sent': 'Enviado',
    'crm.open_rate': 'Taxa de abertura',
    'crm.click_rate': 'Taxa de cliques',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificações',
    'settings.profile': 'Perfil',
    'settings.change_password': 'Alterar senha',
    
    // Roles
    'role.admin': 'Administrador',
    'role.teacher': 'Professor',
    'role.parent': 'Responsável',
    'role.student': 'Aluno',
    'role.vocal': 'Representante',
    'role.super_admin': 'Super Admin',
    
    // Time
    'time.today': 'Hoje',
    'time.yesterday': 'Ontem',
    'time.tomorrow': 'Amanhã',
    'time.this_week': 'Esta semana',
    'time.this_month': 'Este mês',
    
    // Status
    'status.active': 'Ativo',
    'status.inactive': 'Inativo',
    'status.pending': 'Pendente',
    'status.completed': 'Concluído',
    'status.cancelled': 'Cancelado',
  },
  
  DE: {
    // General
    'app.name': 'IA School',
    'app.loading': 'Laden...',
    'app.error': 'Fehler',
    'app.success': 'Erfolg',
    'app.save': 'Speichern',
    'app.cancel': 'Abbrechen',
    'app.delete': 'Löschen',
    'app.edit': 'Bearbeiten',
    'app.create': 'Erstellen',
    'app.search': 'Suchen',
    'app.filter': 'Filtern',
    'app.export': 'Exportieren',
    'app.import': 'Importieren',
    'app.back': 'Zurück',
    'app.next': 'Weiter',
    'app.previous': 'Zurück',
    'app.confirm': 'Bestätigen',
    'app.close': 'Schließen',
    'app.yes': 'Ja',
    'app.no': 'Nein',
    'app.all': 'Alle',
    'app.none': 'Keine',
    'app.view': 'Ansehen',
    'app.download': 'Herunterladen',
    'app.upload': 'Hochladen',
    'app.send': 'Senden',
    'app.copy': 'Kopieren',
    'app.copied': 'Kopiert',
    
    // Auth
    'auth.login': 'Anmelden',
    'auth.logout': 'Abmelden',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.forgot_password': 'Passwort vergessen?',
    'auth.login_error': 'Ungültige Anmeldedaten',
    'auth.welcome_back': 'Willkommen zurück',
    
    // Navigation
    'nav.dashboard': 'Startseite',
    'nav.announcements': 'Ankündigungen',
    'nav.messages': 'Nachrichten',
    'nav.calendar': 'Kalender',
    'nav.tasks': 'Aufgaben',
    'nav.attendance': 'Anwesenheit',
    'nav.grades': 'Noten',
    'nav.payments': 'Zahlungen',
    'nav.documents': 'Dokumente',
    'nav.polls': 'Umfragen',
    'nav.appointments': 'Termine',
    'nav.chatbot': 'KI-Assistent',
    'nav.directory': 'Verzeichnis',
    'nav.settings': 'Einstellungen',
    'nav.invitations': 'Einladungen',
    'nav.crm': 'CRM',
    
    // Dashboard
    'dashboard.welcome': 'Willkommen',
    'dashboard.pending_tasks': 'Ausstehende Aufgaben',
    'dashboard.upcoming_events': 'Kommende Ereignisse',
    'dashboard.recent_announcements': 'Aktuelle Ankündigungen',
    'dashboard.unread_messages': 'Ungelesene Nachrichten',
    'dashboard.pending_payments': 'Ausstehende Zahlungen',
    'dashboard.today_attendance': 'Heutige Anwesenheit',
    
    // Announcements
    'announcements.title': 'Ankündigungen',
    'announcements.new': 'Neue Ankündigung',
    'announcements.no_announcements': 'Keine Ankündigungen',
    'announcements.mark_read': 'Als gelesen markieren',
    'announcements.urgent': 'Dringend',
    'announcements.normal': 'Normal',
    
    // Messages
    'messages.title': 'Nachrichten',
    'messages.new_conversation': 'Neue Unterhaltung',
    'messages.no_messages': 'Keine Nachrichten',
    'messages.type_message': 'Nachricht eingeben...',
    'messages.send': 'Senden',
    'messages.direct': 'Direkt',
    'messages.groups': 'Gruppen',
    
    // Tasks
    'tasks.title': 'Aufgaben',
    'tasks.new_task': 'Neue Aufgabe',
    'tasks.no_tasks': 'Keine Aufgaben',
    'tasks.due_date': 'Fälligkeitsdatum',
    'tasks.submit': 'Einreichen',
    'tasks.submitted': 'Eingereicht',
    'tasks.pending': 'Ausstehend',
    'tasks.graded': 'Bewertet',
    
    // Attendance
    'attendance.title': 'Anwesenheit',
    'attendance.present': 'Anwesend',
    'attendance.absent': 'Abwesend',
    'attendance.late': 'Verspätet',
    'attendance.justified': 'Entschuldigt',
    'attendance.take_attendance': 'Anwesenheit erfassen',
    
    // Grades
    'grades.title': 'Noten',
    'grades.average': 'Durchschnitt',
    'grades.subject': 'Fach',
    'grades.grade': 'Note',
    'grades.date': 'Datum',
    
    // Payments
    'payments.title': 'Zahlungen',
    'payments.pending': 'Ausstehend',
    'payments.paid': 'Bezahlt',
    'payments.amount': 'Betrag',
    'payments.due_date': 'Fälligkeitsdatum',
    'payments.pay_now': 'Jetzt bezahlen',
    'payments.receipt': 'Quittung',
    
    // Documents
    'documents.title': 'Dokumente',
    'documents.sign': 'Unterschreiben',
    'documents.signed': 'Unterschrieben',
    'documents.pending_signature': 'Warten auf Unterschrift',
    'documents.download': 'Herunterladen',
    
    // Appointments
    'appointments.title': 'Termine',
    'appointments.new': 'Neuer Termin',
    'appointments.schedule': 'Planen',
    'appointments.cancel': 'Termin absagen',
    'appointments.confirm': 'Termin bestätigen',
    'appointments.date': 'Datum',
    'appointments.time': 'Uhrzeit',
    'appointments.teacher': 'Lehrer',
    'appointments.parent': 'Elternteil',
    
    // Chatbot
    'chatbot.title': 'KI-Assistent',
    'chatbot.placeholder': 'Frage eingeben...',
    'chatbot.thinking': 'Denke nach...',
    'chatbot.error': 'Fehler bei der Verarbeitung',
    
    // Directory
    'directory.title': 'Verzeichnis',
    'directory.students': 'Schüler',
    'directory.parents': 'Eltern',
    'directory.staff': 'Personal',
    'directory.search_placeholder': 'Nach Name oder E-Mail suchen...',
    
    // CRM
    'crm.title': 'CRM & Kommunikation',
    'crm.segments': 'Segmente',
    'crm.campaigns': 'Kampagnen',
    'crm.templates': 'Vorlagen',
    'crm.new_segment': 'Neues Segment',
    'crm.new_campaign': 'Neue Kampagne',
    'crm.recipients': 'Empfänger',
    'crm.send_now': 'Jetzt senden',
    'crm.schedule': 'Planen',
    'crm.draft': 'Entwurf',
    'crm.sent': 'Gesendet',
    'crm.open_rate': 'Öffnungsrate',
    'crm.click_rate': 'Klickrate',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.language': 'Sprache',
    'settings.notifications': 'Benachrichtigungen',
    'settings.profile': 'Profil',
    'settings.change_password': 'Passwort ändern',
    
    // Roles
    'role.admin': 'Administrator',
    'role.teacher': 'Lehrer',
    'role.parent': 'Elternteil',
    'role.student': 'Schüler',
    'role.vocal': 'Klassensprecher',
    'role.super_admin': 'Super Admin',
    
    // Time
    'time.today': 'Heute',
    'time.yesterday': 'Gestern',
    'time.tomorrow': 'Morgen',
    'time.this_week': 'Diese Woche',
    'time.this_month': 'Diesen Monat',
    
    // Status
    'status.active': 'Aktiv',
    'status.inactive': 'Inaktiv',
    'status.pending': 'Ausstehend',
    'status.completed': 'Abgeschlossen',
    'status.cancelled': 'Abgesagt',
  },
  
  FR: {
    // General
    'app.name': 'IA School',
    'app.loading': 'Chargement...',
    'app.error': 'Erreur',
    'app.success': 'Succès',
    'app.save': 'Enregistrer',
    'app.cancel': 'Annuler',
    'app.delete': 'Supprimer',
    'app.edit': 'Modifier',
    'app.create': 'Créer',
    'app.search': 'Rechercher',
    'app.filter': 'Filtrer',
    'app.export': 'Exporter',
    'app.import': 'Importer',
    'app.back': 'Retour',
    'app.next': 'Suivant',
    'app.previous': 'Précédent',
    'app.confirm': 'Confirmer',
    'app.close': 'Fermer',
    'app.yes': 'Oui',
    'app.no': 'Non',
    'app.all': 'Tous',
    'app.none': 'Aucun',
    'app.view': 'Voir',
    'app.download': 'Télécharger',
    'app.upload': 'Téléverser',
    'app.send': 'Envoyer',
    'app.copy': 'Copier',
    'app.copied': 'Copié',
    
    // Auth
    'auth.login': 'Se connecter',
    'auth.logout': 'Se déconnecter',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.forgot_password': 'Mot de passe oublié?',
    'auth.login_error': 'Identifiants invalides',
    'auth.welcome_back': 'Bienvenue',
    
    // Navigation
    'nav.dashboard': 'Accueil',
    'nav.announcements': 'Annonces',
    'nav.messages': 'Messages',
    'nav.calendar': 'Calendrier',
    'nav.tasks': 'Devoirs',
    'nav.attendance': 'Présence',
    'nav.grades': 'Notes',
    'nav.payments': 'Paiements',
    'nav.documents': 'Documents',
    'nav.polls': 'Sondages',
    'nav.appointments': 'Rendez-vous',
    'nav.chatbot': 'Assistant IA',
    'nav.directory': 'Annuaire',
    'nav.settings': 'Paramètres',
    'nav.invitations': 'Invitations',
    'nav.crm': 'CRM',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.pending_tasks': 'Devoirs en attente',
    'dashboard.upcoming_events': 'Événements à venir',
    'dashboard.recent_announcements': 'Annonces récentes',
    'dashboard.unread_messages': 'Messages non lus',
    'dashboard.pending_payments': 'Paiements en attente',
    'dashboard.today_attendance': "Présence du jour",
    
    // Announcements
    'announcements.title': 'Annonces',
    'announcements.new': 'Nouvelle annonce',
    'announcements.no_announcements': 'Aucune annonce',
    'announcements.mark_read': 'Marquer comme lu',
    'announcements.urgent': 'Urgent',
    'announcements.normal': 'Normal',
    
    // Messages
    'messages.title': 'Messages',
    'messages.new_conversation': 'Nouvelle conversation',
    'messages.no_messages': 'Aucun message',
    'messages.type_message': 'Écrire un message...',
    'messages.send': 'Envoyer',
    'messages.direct': 'Directs',
    'messages.groups': 'Groupes',
    
    // Tasks
    'tasks.title': 'Devoirs',
    'tasks.new_task': 'Nouveau devoir',
    'tasks.no_tasks': 'Aucun devoir',
    'tasks.due_date': 'Date limite',
    'tasks.submit': 'Remettre',
    'tasks.submitted': 'Remis',
    'tasks.pending': 'En attente',
    'tasks.graded': 'Noté',
    
    // Attendance
    'attendance.title': 'Présence',
    'attendance.present': 'Présent',
    'attendance.absent': 'Absent',
    'attendance.late': 'En retard',
    'attendance.justified': 'Justifié',
    'attendance.take_attendance': 'Faire l\'appel',
    
    // Grades
    'grades.title': 'Notes',
    'grades.average': 'Moyenne',
    'grades.subject': 'Matière',
    'grades.grade': 'Note',
    'grades.date': 'Date',
    
    // Payments
    'payments.title': 'Paiements',
    'payments.pending': 'En attente',
    'payments.paid': 'Payés',
    'payments.amount': 'Montant',
    'payments.due_date': 'Date d\'échéance',
    'payments.pay_now': 'Payer maintenant',
    'payments.receipt': 'Reçu',
    
    // Documents
    'documents.title': 'Documents',
    'documents.sign': 'Signer',
    'documents.signed': 'Signé',
    'documents.pending_signature': 'En attente de signature',
    'documents.download': 'Télécharger',
    
    // Appointments
    'appointments.title': 'Rendez-vous',
    'appointments.new': 'Nouveau rendez-vous',
    'appointments.schedule': 'Planifier',
    'appointments.cancel': 'Annuler le rendez-vous',
    'appointments.confirm': 'Confirmer le rendez-vous',
    'appointments.date': 'Date',
    'appointments.time': 'Heure',
    'appointments.teacher': 'Enseignant',
    'appointments.parent': 'Parent',
    
    // Chatbot
    'chatbot.title': 'Assistant IA',
    'chatbot.placeholder': 'Posez votre question...',
    'chatbot.thinking': 'Réflexion...',
    'chatbot.error': 'Erreur lors du traitement',
    
    // Directory
    'directory.title': 'Annuaire',
    'directory.students': 'Élèves',
    'directory.parents': 'Parents',
    'directory.staff': 'Personnel',
    'directory.search_placeholder': 'Rechercher par nom ou e-mail...',
    
    // CRM
    'crm.title': 'CRM & Communication',
    'crm.segments': 'Segments',
    'crm.campaigns': 'Campagnes',
    'crm.templates': 'Modèles',
    'crm.new_segment': 'Nouveau segment',
    'crm.new_campaign': 'Nouvelle campagne',
    'crm.recipients': 'Destinataires',
    'crm.send_now': 'Envoyer maintenant',
    'crm.schedule': 'Programmer',
    'crm.draft': 'Brouillon',
    'crm.sent': 'Envoyé',
    'crm.open_rate': 'Taux d\'ouverture',
    'crm.click_rate': 'Taux de clics',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.notifications': 'Notifications',
    'settings.profile': 'Profil',
    'settings.change_password': 'Changer le mot de passe',
    
    // Roles
    'role.admin': 'Administrateur',
    'role.teacher': 'Enseignant',
    'role.parent': 'Parent',
    'role.student': 'Élève',
    'role.vocal': 'Délégué',
    'role.super_admin': 'Super Admin',
    
    // Time
    'time.today': 'Aujourd\'hui',
    'time.yesterday': 'Hier',
    'time.tomorrow': 'Demain',
    'time.this_week': 'Cette semaine',
    'time.this_month': 'Ce mois',
    
    // Status
    'status.active': 'Actif',
    'status.inactive': 'Inactif',
    'status.pending': 'En attente',
    'status.completed': 'Terminé',
    'status.cancelled': 'Annulé',
  },
  
  JA: {
    // General
    'app.name': 'IAスクール',
    'app.loading': '読み込み中...',
    'app.error': 'エラー',
    'app.success': '成功',
    'app.save': '保存',
    'app.cancel': 'キャンセル',
    'app.delete': '削除',
    'app.edit': '編集',
    'app.create': '作成',
    'app.search': '検索',
    'app.filter': 'フィルター',
    'app.export': 'エクスポート',
    'app.import': 'インポート',
    'app.back': '戻る',
    'app.next': '次へ',
    'app.previous': '前へ',
    'app.confirm': '確認',
    'app.close': '閉じる',
    'app.yes': 'はい',
    'app.no': 'いいえ',
    'app.all': 'すべて',
    'app.none': 'なし',
    'app.view': '表示',
    'app.download': 'ダウンロード',
    'app.upload': 'アップロード',
    'app.send': '送信',
    'app.copy': 'コピー',
    'app.copied': 'コピーしました',
    
    // Auth
    'auth.login': 'ログイン',
    'auth.logout': 'ログアウト',
    'auth.email': 'メールアドレス',
    'auth.password': 'パスワード',
    'auth.forgot_password': 'パスワードを忘れた場合',
    'auth.login_error': '認証情報が無効です',
    'auth.welcome_back': 'おかえりなさい',
    
    // Navigation
    'nav.dashboard': 'ホーム',
    'nav.announcements': 'お知らせ',
    'nav.messages': 'メッセージ',
    'nav.calendar': 'カレンダー',
    'nav.tasks': '課題',
    'nav.attendance': '出席',
    'nav.grades': '成績',
    'nav.payments': '支払い',
    'nav.documents': '書類',
    'nav.polls': 'アンケート',
    'nav.appointments': '予約',
    'nav.chatbot': 'AIアシスタント',
    'nav.directory': '名簿',
    'nav.settings': '設定',
    'nav.invitations': '招待',
    'nav.crm': 'CRM',
    
    // Dashboard
    'dashboard.welcome': 'ようこそ',
    'dashboard.pending_tasks': '未完了の課題',
    'dashboard.upcoming_events': '今後のイベント',
    'dashboard.recent_announcements': '最近のお知らせ',
    'dashboard.unread_messages': '未読メッセージ',
    'dashboard.pending_payments': '未払いの支払い',
    'dashboard.today_attendance': '本日の出席',
    
    // Announcements
    'announcements.title': 'お知らせ',
    'announcements.new': '新しいお知らせ',
    'announcements.no_announcements': 'お知らせはありません',
    'announcements.mark_read': '既読にする',
    'announcements.urgent': '緊急',
    'announcements.normal': '通常',
    
    // Messages
    'messages.title': 'メッセージ',
    'messages.new_conversation': '新しい会話',
    'messages.no_messages': 'メッセージはありません',
    'messages.type_message': 'メッセージを入力...',
    'messages.send': '送信',
    'messages.direct': 'ダイレクト',
    'messages.groups': 'グループ',
    
    // Tasks
    'tasks.title': '課題',
    'tasks.new_task': '新しい課題',
    'tasks.no_tasks': '課題はありません',
    'tasks.due_date': '提出期限',
    'tasks.submit': '提出',
    'tasks.submitted': '提出済み',
    'tasks.pending': '未提出',
    'tasks.graded': '採点済み',
    
    // Attendance
    'attendance.title': '出席',
    'attendance.present': '出席',
    'attendance.absent': '欠席',
    'attendance.late': '遅刻',
    'attendance.justified': '公欠',
    'attendance.take_attendance': '出席を取る',
    
    // Grades
    'grades.title': '成績',
    'grades.average': '平均',
    'grades.subject': '科目',
    'grades.grade': '成績',
    'grades.date': '日付',
    
    // Payments
    'payments.title': '支払い',
    'payments.pending': '未払い',
    'payments.paid': '支払い済み',
    'payments.amount': '金額',
    'payments.due_date': '支払期限',
    'payments.pay_now': '今すぐ支払う',
    'payments.receipt': '領収書',
    
    // Documents
    'documents.title': '書類',
    'documents.sign': '署名',
    'documents.signed': '署名済み',
    'documents.pending_signature': '署名待ち',
    'documents.download': 'ダウンロード',
    
    // Appointments
    'appointments.title': '予約',
    'appointments.new': '新しい予約',
    'appointments.schedule': '予約する',
    'appointments.cancel': '予約をキャンセル',
    'appointments.confirm': '予約を確認',
    'appointments.date': '日付',
    'appointments.time': '時間',
    'appointments.teacher': '先生',
    'appointments.parent': '保護者',
    
    // Chatbot
    'chatbot.title': 'AIアシスタント',
    'chatbot.placeholder': '質問を入力...',
    'chatbot.thinking': '考え中...',
    'chatbot.error': 'エラーが発生しました',
    
    // Directory
    'directory.title': '名簿',
    'directory.students': '生徒',
    'directory.parents': '保護者',
    'directory.staff': 'スタッフ',
    'directory.search_placeholder': '名前またはメールで検索...',
    
    // CRM
    'crm.title': 'CRM＆コミュニケーション',
    'crm.segments': 'セグメント',
    'crm.campaigns': 'キャンペーン',
    'crm.templates': 'テンプレート',
    'crm.new_segment': '新しいセグメント',
    'crm.new_campaign': '新しいキャンペーン',
    'crm.recipients': '受信者',
    'crm.send_now': '今すぐ送信',
    'crm.schedule': 'スケジュール',
    'crm.draft': '下書き',
    'crm.sent': '送信済み',
    'crm.open_rate': '開封率',
    'crm.click_rate': 'クリック率',
    
    // Settings
    'settings.title': '設定',
    'settings.language': '言語',
    'settings.notifications': '通知',
    'settings.profile': 'プロフィール',
    'settings.change_password': 'パスワードを変更',
    
    // Roles
    'role.admin': '管理者',
    'role.teacher': '先生',
    'role.parent': '保護者',
    'role.student': '生徒',
    'role.vocal': '学級委員',
    'role.super_admin': 'スーパー管理者',
    
    // Time
    'time.today': '今日',
    'time.yesterday': '昨日',
    'time.tomorrow': '明日',
    'time.this_week': '今週',
    'time.this_month': '今月',
    
    // Status
    'status.active': '有効',
    'status.inactive': '無効',
    'status.pending': '保留中',
    'status.completed': '完了',
    'status.cancelled': 'キャンセル',
  }
} as const;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] || translations.ES[key] || key;
}
