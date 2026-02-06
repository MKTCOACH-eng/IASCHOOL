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

type TranslationKeys = {
  // Navigation
  nav: {
    home: string;
    dashboard: string;
    messages: string;
    announcements: string;
    calendar: string;
    tasks: string;
    payments: string;
    documents: string;
    chatbot: string;
    directory: string;
    appointments: string;
    attendance: string;
    academic: string;
    polls: string;
    invitations: string;
    crm: string;
    superAdmin: string;
    logout: string;
    login: string;
  };
  // Landing page
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    features: {
      title: string;
      communication: { title: string; desc: string };
      payments: { title: string; desc: string };
      academic: { title: string; desc: string };
      security: { title: string; desc: string };
    };
    forFamilies: {
      title: string;
      desc: string;
    };
    forTeachers: {
      title: string;
      desc: string;
    };
  };
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    yes: string;
    no: string;
    all: string;
    none: string;
    select: string;
    noResults: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  // Dashboard
  dashboard: {
    welcome: string;
    overview: string;
    recentActivity: string;
    pendingTasks: string;
    unreadMessages: string;
    upcomingEvents: string;
    announcements: string;
  };
  // Messages
  messages: {
    title: string;
    newMessage: string;
    direct: string;
    groups: string;
    typeMessage: string;
    send: string;
    noMessages: string;
    searchContacts: string;
  };
  // Payments
  payments: {
    title: string;
    pending: string;
    paid: string;
    overdue: string;
    amount: string;
    dueDate: string;
    payNow: string;
    history: string;
    speiInstructions: string;
  };
  // Tasks
  tasks: {
    title: string;
    newTask: string;
    dueDate: string;
    priority: string;
    status: string;
    completed: string;
    pending: string;
    inProgress: string;
    submit: string;
  };
  // Calendar
  calendar: {
    title: string;
    today: string;
    month: string;
    week: string;
    day: string;
    newEvent: string;
    noEvents: string;
  };
  // Documents
  documents: {
    title: string;
    sign: string;
    signed: string;
    pending: string;
    verify: string;
    download: string;
  };
  // Chatbot
  chatbot: {
    title: string;
    askQuestion: string;
    thinking: string;
    helpful: string;
    notHelpful: string;
  };
  // Appointments
  appointments: {
    title: string;
    schedule: string;
    availableSlots: string;
    selectTeacher: string;
    selectDate: string;
    selectTime: string;
    confirm: string;
    cancel: string;
    reason: string;
  };
  // Attendance
  attendance: {
    title: string;
    present: string;
    absent: string;
    late: string;
    excused: string;
    date: string;
    student: string;
  };
  // CRM
  crm: {
    title: string;
    contacts: string;
    campaigns: string;
    templates: string;
    newCampaign: string;
    sendEmail: string;
    emailsSent: string;
    openRate: string;
  };
  // Roles
  roles: {
    admin: string;
    teacher: string;
    parent: string;
    student: string;
    superAdmin: string;
  };
  // Time
  time: {
    today: string;
    yesterday: string;
    daysAgo: string;
    hoursAgo: string;
    minutesAgo: string;
    justNow: string;
  };
};

export const translations: Record<Language, TranslationKeys> = {
  es: {
    nav: {
      home: 'Inicio',
      dashboard: 'Panel',
      messages: 'Mensajes',
      announcements: 'Comunicados',
      calendar: 'Calendario',
      tasks: 'Tareas',
      payments: 'Pagos',
      documents: 'Documentos',
      chatbot: 'Asistente IA',
      directory: 'Directorio',
      appointments: 'Citas',
      attendance: 'Asistencia',
      academic: 'Académico',
      polls: 'Encuestas',
      invitations: 'Invitaciones',
      crm: 'CRM',
      superAdmin: 'Super Admin',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión'
    },
    landing: {
      hero: {
        title: 'La Plataforma Educativa del Futuro',
        subtitle: 'Conectamos familias, profesores y estudiantes en un ecosistema digital seguro e inteligente.',
        cta: 'Comenzar Ahora'
      },
      features: {
        title: 'Todo lo que necesitas',
        communication: { title: 'Comunicación Instantánea', desc: 'Mensajes directos y grupales con profesores y familias.' },
        payments: { title: 'Pagos Simplificados', desc: 'Gestión de colegiaturas y pagos sin comisiones.' },
        academic: { title: 'Seguimiento Académico', desc: 'Calificaciones, tareas y asistencia en tiempo real.' },
        security: { title: 'Seguridad Total', desc: 'Firma digital y verificación de documentos.' }
      },
      forFamilies: {
        title: 'Para Familias',
        desc: 'Mantente conectado con la educación de tus hijos.'
      },
      forTeachers: {
        title: 'Para Profesores',
        desc: 'Herramientas digitales para potenciar tu enseñanza.'
      }
    },
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      download: 'Descargar',
      upload: 'Subir',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      all: 'Todos',
      none: 'Ninguno',
      select: 'Seleccionar',
      noResults: 'Sin resultados',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información'
    },
    dashboard: {
      welcome: 'Bienvenido',
      overview: 'Resumen',
      recentActivity: 'Actividad Reciente',
      pendingTasks: 'Tareas Pendientes',
      unreadMessages: 'Mensajes sin leer',
      upcomingEvents: 'Próximos Eventos',
      announcements: 'Comunicados'
    },
    messages: {
      title: 'Mensajes',
      newMessage: 'Nuevo Mensaje',
      direct: 'Directos',
      groups: 'Grupos',
      typeMessage: 'Escribe un mensaje...',
      send: 'Enviar',
      noMessages: 'No hay mensajes',
      searchContacts: 'Buscar contactos'
    },
    payments: {
      title: 'Pagos',
      pending: 'Pendiente',
      paid: 'Pagado',
      overdue: 'Vencido',
      amount: 'Monto',
      dueDate: 'Fecha límite',
      payNow: 'Pagar Ahora',
      history: 'Historial',
      speiInstructions: 'Instrucciones SPEI'
    },
    tasks: {
      title: 'Tareas',
      newTask: 'Nueva Tarea',
      dueDate: 'Fecha de entrega',
      priority: 'Prioridad',
      status: 'Estado',
      completed: 'Completada',
      pending: 'Pendiente',
      inProgress: 'En progreso',
      submit: 'Entregar'
    },
    calendar: {
      title: 'Calendario',
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      newEvent: 'Nuevo Evento',
      noEvents: 'Sin eventos'
    },
    documents: {
      title: 'Documentos',
      sign: 'Firmar',
      signed: 'Firmado',
      pending: 'Pendiente',
      verify: 'Verificar',
      download: 'Descargar'
    },
    chatbot: {
      title: 'Asistente IA',
      askQuestion: '¿En qué puedo ayudarte?',
      thinking: 'Pensando...',
      helpful: '¿Fue útil?',
      notHelpful: 'No fue útil'
    },
    appointments: {
      title: 'Citas',
      schedule: 'Agendar',
      availableSlots: 'Horarios disponibles',
      selectTeacher: 'Seleccionar profesor',
      selectDate: 'Seleccionar fecha',
      selectTime: 'Seleccionar hora',
      confirm: 'Confirmar cita',
      cancel: 'Cancelar cita',
      reason: 'Motivo'
    },
    attendance: {
      title: 'Asistencia',
      present: 'Presente',
      absent: 'Ausente',
      late: 'Tarde',
      excused: 'Justificado',
      date: 'Fecha',
      student: 'Estudiante'
    },
    crm: {
      title: 'CRM y Comunicación',
      contacts: 'Contactos',
      campaigns: 'Campañas',
      templates: 'Plantillas',
      newCampaign: 'Nueva Campaña',
      sendEmail: 'Enviar Email',
      emailsSent: 'Emails enviados',
      openRate: 'Tasa de apertura'
    },
    roles: {
      admin: 'Administrador',
      teacher: 'Profesor',
      parent: 'Padre/Madre',
      student: 'Alumno',
      superAdmin: 'Super Admin'
    },
    time: {
      today: 'Hoy',
      yesterday: 'Ayer',
      daysAgo: 'hace {n} días',
      hoursAgo: 'hace {n} horas',
      minutesAgo: 'hace {n} minutos',
      justNow: 'Justo ahora'
    }
  },
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      messages: 'Messages',
      announcements: 'Announcements',
      calendar: 'Calendar',
      tasks: 'Tasks',
      payments: 'Payments',
      documents: 'Documents',
      chatbot: 'AI Assistant',
      directory: 'Directory',
      appointments: 'Appointments',
      attendance: 'Attendance',
      academic: 'Academic',
      polls: 'Polls',
      invitations: 'Invitations',
      crm: 'CRM',
      superAdmin: 'Super Admin',
      logout: 'Logout',
      login: 'Login'
    },
    landing: {
      hero: {
        title: 'The Educational Platform of the Future',
        subtitle: 'Connecting families, teachers, and students in a secure and intelligent digital ecosystem.',
        cta: 'Get Started'
      },
      features: {
        title: 'Everything You Need',
        communication: { title: 'Instant Communication', desc: 'Direct and group messages with teachers and families.' },
        payments: { title: 'Simplified Payments', desc: 'Tuition and payment management without fees.' },
        academic: { title: 'Academic Tracking', desc: 'Grades, assignments, and attendance in real-time.' },
        security: { title: 'Total Security', desc: 'Digital signatures and document verification.' }
      },
      forFamilies: {
        title: 'For Families',
        desc: 'Stay connected with your children\'s education.'
      },
      forTeachers: {
        title: 'For Teachers',
        desc: 'Digital tools to enhance your teaching.'
      }
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      none: 'None',
      select: 'Select',
      noResults: 'No results',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    dashboard: {
      welcome: 'Welcome',
      overview: 'Overview',
      recentActivity: 'Recent Activity',
      pendingTasks: 'Pending Tasks',
      unreadMessages: 'Unread Messages',
      upcomingEvents: 'Upcoming Events',
      announcements: 'Announcements'
    },
    messages: {
      title: 'Messages',
      newMessage: 'New Message',
      direct: 'Direct',
      groups: 'Groups',
      typeMessage: 'Type a message...',
      send: 'Send',
      noMessages: 'No messages',
      searchContacts: 'Search contacts'
    },
    payments: {
      title: 'Payments',
      pending: 'Pending',
      paid: 'Paid',
      overdue: 'Overdue',
      amount: 'Amount',
      dueDate: 'Due date',
      payNow: 'Pay Now',
      history: 'History',
      speiInstructions: 'SPEI Instructions'
    },
    tasks: {
      title: 'Tasks',
      newTask: 'New Task',
      dueDate: 'Due date',
      priority: 'Priority',
      status: 'Status',
      completed: 'Completed',
      pending: 'Pending',
      inProgress: 'In Progress',
      submit: 'Submit'
    },
    calendar: {
      title: 'Calendar',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      newEvent: 'New Event',
      noEvents: 'No events'
    },
    documents: {
      title: 'Documents',
      sign: 'Sign',
      signed: 'Signed',
      pending: 'Pending',
      verify: 'Verify',
      download: 'Download'
    },
    chatbot: {
      title: 'AI Assistant',
      askQuestion: 'How can I help you?',
      thinking: 'Thinking...',
      helpful: 'Was this helpful?',
      notHelpful: 'Not helpful'
    },
    appointments: {
      title: 'Appointments',
      schedule: 'Schedule',
      availableSlots: 'Available slots',
      selectTeacher: 'Select teacher',
      selectDate: 'Select date',
      selectTime: 'Select time',
      confirm: 'Confirm appointment',
      cancel: 'Cancel appointment',
      reason: 'Reason'
    },
    attendance: {
      title: 'Attendance',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      date: 'Date',
      student: 'Student'
    },
    crm: {
      title: 'CRM & Communication',
      contacts: 'Contacts',
      campaigns: 'Campaigns',
      templates: 'Templates',
      newCampaign: 'New Campaign',
      sendEmail: 'Send Email',
      emailsSent: 'Emails sent',
      openRate: 'Open rate'
    },
    roles: {
      admin: 'Administrator',
      teacher: 'Teacher',
      parent: 'Parent',
      student: 'Student',
      superAdmin: 'Super Admin'
    },
    time: {
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{n} days ago',
      hoursAgo: '{n} hours ago',
      minutesAgo: '{n} minutes ago',
      justNow: 'Just now'
    }
  },
  pt: {
    nav: {
      home: 'Início',
      dashboard: 'Painel',
      messages: 'Mensagens',
      announcements: 'Comunicados',
      calendar: 'Calendário',
      tasks: 'Tarefas',
      payments: 'Pagamentos',
      documents: 'Documentos',
      chatbot: 'Assistente IA',
      directory: 'Diretório',
      appointments: 'Consultas',
      attendance: 'Frequência',
      academic: 'Acadêmico',
      polls: 'Enquetes',
      invitations: 'Convites',
      crm: 'CRM',
      superAdmin: 'Super Admin',
      logout: 'Sair',
      login: 'Entrar'
    },
    landing: {
      hero: {
        title: 'A Plataforma Educacional do Futuro',
        subtitle: 'Conectando famílias, professores e alunos em um ecossistema digital seguro e inteligente.',
        cta: 'Começar Agora'
      },
      features: {
        title: 'Tudo que Você Precisa',
        communication: { title: 'Comunicação Instantânea', desc: 'Mensagens diretas e em grupo com professores e famílias.' },
        payments: { title: 'Pagamentos Simplificados', desc: 'Gestão de mensalidades e pagamentos sem taxas.' },
        academic: { title: 'Acompanhamento Acadêmico', desc: 'Notas, tarefas e frequência em tempo real.' },
        security: { title: 'Segurança Total', desc: 'Assinatura digital e verificação de documentos.' }
      },
      forFamilies: {
        title: 'Para Famílias',
        desc: 'Mantenha-se conectado com a educação dos seus filhos.'
      },
      forTeachers: {
        title: 'Para Professores',
        desc: 'Ferramentas digitais para potencializar seu ensino.'
      }
    },
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      download: 'Baixar',
      upload: 'Enviar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      confirm: 'Confirmar',
      yes: 'Sim',
      no: 'Não',
      all: 'Todos',
      none: 'Nenhum',
      select: 'Selecionar',
      noResults: 'Sem resultados',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação'
    },
    dashboard: {
      welcome: 'Bem-vindo',
      overview: 'Visão Geral',
      recentActivity: 'Atividade Recente',
      pendingTasks: 'Tarefas Pendentes',
      unreadMessages: 'Mensagens não lidas',
      upcomingEvents: 'Próximos Eventos',
      announcements: 'Comunicados'
    },
    messages: {
      title: 'Mensagens',
      newMessage: 'Nova Mensagem',
      direct: 'Diretas',
      groups: 'Grupos',
      typeMessage: 'Digite uma mensagem...',
      send: 'Enviar',
      noMessages: 'Sem mensagens',
      searchContacts: 'Buscar contatos'
    },
    payments: {
      title: 'Pagamentos',
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      amount: 'Valor',
      dueDate: 'Data de vencimento',
      payNow: 'Pagar Agora',
      history: 'Histórico',
      speiInstructions: 'Instruções de Transferência'
    },
    tasks: {
      title: 'Tarefas',
      newTask: 'Nova Tarefa',
      dueDate: 'Data de entrega',
      priority: 'Prioridade',
      status: 'Status',
      completed: 'Concluída',
      pending: 'Pendente',
      inProgress: 'Em andamento',
      submit: 'Entregar'
    },
    calendar: {
      title: 'Calendário',
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      newEvent: 'Novo Evento',
      noEvents: 'Sem eventos'
    },
    documents: {
      title: 'Documentos',
      sign: 'Assinar',
      signed: 'Assinado',
      pending: 'Pendente',
      verify: 'Verificar',
      download: 'Baixar'
    },
    chatbot: {
      title: 'Assistente IA',
      askQuestion: 'Como posso ajudar?',
      thinking: 'Pensando...',
      helpful: 'Foi útil?',
      notHelpful: 'Não foi útil'
    },
    appointments: {
      title: 'Consultas',
      schedule: 'Agendar',
      availableSlots: 'Horários disponíveis',
      selectTeacher: 'Selecionar professor',
      selectDate: 'Selecionar data',
      selectTime: 'Selecionar horário',
      confirm: 'Confirmar consulta',
      cancel: 'Cancelar consulta',
      reason: 'Motivo'
    },
    attendance: {
      title: 'Frequência',
      present: 'Presente',
      absent: 'Ausente',
      late: 'Atrasado',
      excused: 'Justificado',
      date: 'Data',
      student: 'Aluno'
    },
    crm: {
      title: 'CRM e Comunicação',
      contacts: 'Contatos',
      campaigns: 'Campanhas',
      templates: 'Modelos',
      newCampaign: 'Nova Campanha',
      sendEmail: 'Enviar Email',
      emailsSent: 'Emails enviados',
      openRate: 'Taxa de abertura'
    },
    roles: {
      admin: 'Administrador',
      teacher: 'Professor',
      parent: 'Pai/Mãe',
      student: 'Aluno',
      superAdmin: 'Super Admin'
    },
    time: {
      today: 'Hoje',
      yesterday: 'Ontem',
      daysAgo: 'há {n} dias',
      hoursAgo: 'há {n} horas',
      minutesAgo: 'há {n} minutos',
      justNow: 'Agora mesmo'
    }
  },
  de: {
    nav: {
      home: 'Startseite',
      dashboard: 'Dashboard',
      messages: 'Nachrichten',
      announcements: 'Mitteilungen',
      calendar: 'Kalender',
      tasks: 'Aufgaben',
      payments: 'Zahlungen',
      documents: 'Dokumente',
      chatbot: 'KI-Assistent',
      directory: 'Verzeichnis',
      appointments: 'Termine',
      attendance: 'Anwesenheit',
      academic: 'Akademisch',
      polls: 'Umfragen',
      invitations: 'Einladungen',
      crm: 'CRM',
      superAdmin: 'Super Admin',
      logout: 'Abmelden',
      login: 'Anmelden'
    },
    landing: {
      hero: {
        title: 'Die Bildungsplattform der Zukunft',
        subtitle: 'Wir verbinden Familien, Lehrer und Schüler in einem sicheren und intelligenten digitalen Ökosystem.',
        cta: 'Jetzt Starten'
      },
      features: {
        title: 'Alles was Sie brauchen',
        communication: { title: 'Sofortige Kommunikation', desc: 'Direkte und Gruppennachrichten mit Lehrern und Familien.' },
        payments: { title: 'Vereinfachte Zahlungen', desc: 'Gebühren- und Zahlungsverwaltung ohne Provisionen.' },
        academic: { title: 'Akademische Verfolgung', desc: 'Noten, Aufgaben und Anwesenheit in Echtzeit.' },
        security: { title: 'Vollständige Sicherheit', desc: 'Digitale Signaturen und Dokumentenverifizierung.' }
      },
      forFamilies: {
        title: 'Für Familien',
        desc: 'Bleiben Sie mit der Bildung Ihrer Kinder verbunden.'
      },
      forTeachers: {
        title: 'Für Lehrer',
        desc: 'Digitale Werkzeuge zur Verbesserung Ihres Unterrichts.'
      }
    },
    common: {
      loading: 'Laden...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      filter: 'Filtern',
      export: 'Exportieren',
      import: 'Importieren',
      download: 'Herunterladen',
      upload: 'Hochladen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Zurück',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein',
      all: 'Alle',
      none: 'Keine',
      select: 'Auswählen',
      noResults: 'Keine Ergebnisse',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      info: 'Information'
    },
    dashboard: {
      welcome: 'Willkommen',
      overview: 'Übersicht',
      recentActivity: 'Letzte Aktivität',
      pendingTasks: 'Ausstehende Aufgaben',
      unreadMessages: 'Ungelesene Nachrichten',
      upcomingEvents: 'Kommende Ereignisse',
      announcements: 'Mitteilungen'
    },
    messages: {
      title: 'Nachrichten',
      newMessage: 'Neue Nachricht',
      direct: 'Direkt',
      groups: 'Gruppen',
      typeMessage: 'Nachricht eingeben...',
      send: 'Senden',
      noMessages: 'Keine Nachrichten',
      searchContacts: 'Kontakte suchen'
    },
    payments: {
      title: 'Zahlungen',
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      overdue: 'Überfällig',
      amount: 'Betrag',
      dueDate: 'Fälligkeitsdatum',
      payNow: 'Jetzt Bezahlen',
      history: 'Verlauf',
      speiInstructions: 'Überweisungsanleitung'
    },
    tasks: {
      title: 'Aufgaben',
      newTask: 'Neue Aufgabe',
      dueDate: 'Fälligkeitsdatum',
      priority: 'Priorität',
      status: 'Status',
      completed: 'Abgeschlossen',
      pending: 'Ausstehend',
      inProgress: 'In Bearbeitung',
      submit: 'Einreichen'
    },
    calendar: {
      title: 'Kalender',
      today: 'Heute',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      newEvent: 'Neues Ereignis',
      noEvents: 'Keine Ereignisse'
    },
    documents: {
      title: 'Dokumente',
      sign: 'Unterschreiben',
      signed: 'Unterschrieben',
      pending: 'Ausstehend',
      verify: 'Verifizieren',
      download: 'Herunterladen'
    },
    chatbot: {
      title: 'KI-Assistent',
      askQuestion: 'Wie kann ich helfen?',
      thinking: 'Denke nach...',
      helpful: 'War das hilfreich?',
      notHelpful: 'Nicht hilfreich'
    },
    appointments: {
      title: 'Termine',
      schedule: 'Planen',
      availableSlots: 'Verfügbare Zeiten',
      selectTeacher: 'Lehrer auswählen',
      selectDate: 'Datum auswählen',
      selectTime: 'Zeit auswählen',
      confirm: 'Termin bestätigen',
      cancel: 'Termin absagen',
      reason: 'Grund'
    },
    attendance: {
      title: 'Anwesenheit',
      present: 'Anwesend',
      absent: 'Abwesend',
      late: 'Verspätet',
      excused: 'Entschuldigt',
      date: 'Datum',
      student: 'Schüler'
    },
    crm: {
      title: 'CRM & Kommunikation',
      contacts: 'Kontakte',
      campaigns: 'Kampagnen',
      templates: 'Vorlagen',
      newCampaign: 'Neue Kampagne',
      sendEmail: 'E-Mail senden',
      emailsSent: 'E-Mails gesendet',
      openRate: 'Öffnungsrate'
    },
    roles: {
      admin: 'Administrator',
      teacher: 'Lehrer',
      parent: 'Elternteil',
      student: 'Schüler',
      superAdmin: 'Super Admin'
    },
    time: {
      today: 'Heute',
      yesterday: 'Gestern',
      daysAgo: 'vor {n} Tagen',
      hoursAgo: 'vor {n} Stunden',
      minutesAgo: 'vor {n} Minuten',
      justNow: 'Gerade eben'
    }
  },
  fr: {
    nav: {
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      messages: 'Messages',
      announcements: 'Annonces',
      calendar: 'Calendrier',
      tasks: 'Tâches',
      payments: 'Paiements',
      documents: 'Documents',
      chatbot: 'Assistant IA',
      directory: 'Annuaire',
      appointments: 'Rendez-vous',
      attendance: 'Présence',
      academic: 'Académique',
      polls: 'Sondages',
      invitations: 'Invitations',
      crm: 'CRM',
      superAdmin: 'Super Admin',
      logout: 'Déconnexion',
      login: 'Connexion'
    },
    landing: {
      hero: {
        title: 'La Plateforme Éducative du Futur',
        subtitle: 'Nous connectons les familles, les enseignants et les étudiants dans un écosystème numérique sécurisé et intelligent.',
        cta: 'Commencer'
      },
      features: {
        title: 'Tout ce dont vous avez besoin',
        communication: { title: 'Communication Instantanée', desc: 'Messages directs et de groupe avec les enseignants et les familles.' },
        payments: { title: 'Paiements Simplifiés', desc: 'Gestion des frais de scolarité sans commissions.' },
        academic: { title: 'Suivi Académique', desc: 'Notes, devoirs et présence en temps réel.' },
        security: { title: 'Sécurité Totale', desc: 'Signatures numériques et vérification des documents.' }
      },
      forFamilies: {
        title: 'Pour les Familles',
        desc: 'Restez connecté à l\'éducation de vos enfants.'
      },
      forTeachers: {
        title: 'Pour les Enseignants',
        desc: 'Outils numériques pour améliorer votre enseignement.'
      }
    },
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      download: 'Télécharger',
      upload: 'Téléverser',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
      all: 'Tous',
      none: 'Aucun',
      select: 'Sélectionner',
      noResults: 'Aucun résultat',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information'
    },
    dashboard: {
      welcome: 'Bienvenue',
      overview: 'Aperçu',
      recentActivity: 'Activité Récente',
      pendingTasks: 'Tâches en Attente',
      unreadMessages: 'Messages non lus',
      upcomingEvents: 'Événements à Venir',
      announcements: 'Annonces'
    },
    messages: {
      title: 'Messages',
      newMessage: 'Nouveau Message',
      direct: 'Directs',
      groups: 'Groupes',
      typeMessage: 'Écrivez un message...',
      send: 'Envoyer',
      noMessages: 'Aucun message',
      searchContacts: 'Rechercher des contacts'
    },
    payments: {
      title: 'Paiements',
      pending: 'En attente',
      paid: 'Payé',
      overdue: 'En retard',
      amount: 'Montant',
      dueDate: 'Date d\'échéance',
      payNow: 'Payer Maintenant',
      history: 'Historique',
      speiInstructions: 'Instructions de Virement'
    },
    tasks: {
      title: 'Tâches',
      newTask: 'Nouvelle Tâche',
      dueDate: 'Date limite',
      priority: 'Priorité',
      status: 'Statut',
      completed: 'Terminée',
      pending: 'En attente',
      inProgress: 'En cours',
      submit: 'Soumettre'
    },
    calendar: {
      title: 'Calendrier',
      today: 'Aujourd\'hui',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      newEvent: 'Nouvel Événement',
      noEvents: 'Aucun événement'
    },
    documents: {
      title: 'Documents',
      sign: 'Signer',
      signed: 'Signé',
      pending: 'En attente',
      verify: 'Vérifier',
      download: 'Télécharger'
    },
    chatbot: {
      title: 'Assistant IA',
      askQuestion: 'Comment puis-je vous aider?',
      thinking: 'Réflexion...',
      helpful: 'Était-ce utile?',
      notHelpful: 'Pas utile'
    },
    appointments: {
      title: 'Rendez-vous',
      schedule: 'Planifier',
      availableSlots: 'Créneaux disponibles',
      selectTeacher: 'Sélectionner un enseignant',
      selectDate: 'Sélectionner une date',
      selectTime: 'Sélectionner l\'heure',
      confirm: 'Confirmer le rendez-vous',
      cancel: 'Annuler le rendez-vous',
      reason: 'Raison'
    },
    attendance: {
      title: 'Présence',
      present: 'Présent',
      absent: 'Absent',
      late: 'En retard',
      excused: 'Excusé',
      date: 'Date',
      student: 'Élève'
    },
    crm: {
      title: 'CRM & Communication',
      contacts: 'Contacts',
      campaigns: 'Campagnes',
      templates: 'Modèles',
      newCampaign: 'Nouvelle Campagne',
      sendEmail: 'Envoyer un Email',
      emailsSent: 'Emails envoyés',
      openRate: 'Taux d\'ouverture'
    },
    roles: {
      admin: 'Administrateur',
      teacher: 'Enseignant',
      parent: 'Parent',
      student: 'Élève',
      superAdmin: 'Super Admin'
    },
    time: {
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      daysAgo: 'il y a {n} jours',
      hoursAgo: 'il y a {n} heures',
      minutesAgo: 'il y a {n} minutes',
      justNow: 'À l\'instant'
    }
  },
  ja: {
    nav: {
      home: 'ホーム',
      dashboard: 'ダッシュボード',
      messages: 'メッセージ',
      announcements: 'お知らせ',
      calendar: 'カレンダー',
      tasks: '課題',
      payments: '支払い',
      documents: '書類',
      chatbot: 'AIアシスタント',
      directory: 'ディレクトリ',
      appointments: '予約',
      attendance: '出席',
      academic: '学業',
      polls: 'アンケート',
      invitations: '招待',
      crm: 'CRM',
      superAdmin: 'スーパー管理者',
      logout: 'ログアウト',
      login: 'ログイン'
    },
    landing: {
      hero: {
        title: '未来の教育プラットフォーム',
        subtitle: '安全でインテリジェントなデジタルエコシステムで、家族、教師、生徒をつなぎます。',
        cta: '今すぐ始める'
      },
      features: {
        title: '必要なものすべて',
        communication: { title: 'インスタントコミュニケーション', desc: '教師や家族との直接メッセージとグループメッセージ。' },
        payments: { title: '簡単な支払い', desc: '手数料なしの授業料と支払い管理。' },
        academic: { title: '学業追跡', desc: 'リアルタイムの成績、課題、出席。' },
        security: { title: '完全なセキュリティ', desc: 'デジタル署名と書類検証。' }
      },
      forFamilies: {
        title: 'ご家族向け',
        desc: 'お子様の教育とつながりましょう。'
      },
      forTeachers: {
        title: '教師向け',
        desc: '教育を強化するデジタルツール。'
      }
    },
    common: {
      loading: '読み込み中...',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      create: '作成',
      search: '検索',
      filter: 'フィルター',
      export: 'エクスポート',
      import: 'インポート',
      download: 'ダウンロード',
      upload: 'アップロード',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      confirm: '確認',
      yes: 'はい',
      no: 'いいえ',
      all: 'すべて',
      none: 'なし',
      select: '選択',
      noResults: '結果なし',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報'
    },
    dashboard: {
      welcome: 'ようこそ',
      overview: '概要',
      recentActivity: '最近のアクティビティ',
      pendingTasks: '未完了の課題',
      unreadMessages: '未読メッセージ',
      upcomingEvents: '今後のイベント',
      announcements: 'お知らせ'
    },
    messages: {
      title: 'メッセージ',
      newMessage: '新しいメッセージ',
      direct: 'ダイレクト',
      groups: 'グループ',
      typeMessage: 'メッセージを入力...',
      send: '送信',
      noMessages: 'メッセージなし',
      searchContacts: '連絡先を検索'
    },
    payments: {
      title: '支払い',
      pending: '未払い',
      paid: '支払済み',
      overdue: '期限切れ',
      amount: '金額',
      dueDate: '期限',
      payNow: '今すぐ支払う',
      history: '履歴',
      speiInstructions: '振込手順'
    },
    tasks: {
      title: '課題',
      newTask: '新しい課題',
      dueDate: '締め切り',
      priority: '優先度',
      status: 'ステータス',
      completed: '完了',
      pending: '未完了',
      inProgress: '進行中',
      submit: '提出'
    },
    calendar: {
      title: 'カレンダー',
      today: '今日',
      month: '月',
      week: '週',
      day: '日',
      newEvent: '新しいイベント',
      noEvents: 'イベントなし'
    },
    documents: {
      title: '書類',
      sign: '署名',
      signed: '署名済み',
      pending: '未署名',
      verify: '検証',
      download: 'ダウンロード'
    },
    chatbot: {
      title: 'AIアシスタント',
      askQuestion: 'ご用件は？',
      thinking: '考え中...',
      helpful: '役に立ちましたか？',
      notHelpful: '役に立たなかった'
    },
    appointments: {
      title: '予約',
      schedule: '予約する',
      availableSlots: '空き時間',
      selectTeacher: '教師を選択',
      selectDate: '日付を選択',
      selectTime: '時間を選択',
      confirm: '予約を確認',
      cancel: '予約をキャンセル',
      reason: '理由'
    },
    attendance: {
      title: '出席',
      present: '出席',
      absent: '欠席',
      late: '遅刻',
      excused: '許可済み',
      date: '日付',
      student: '生徒'
    },
    crm: {
      title: 'CRM & コミュニケーション',
      contacts: '連絡先',
      campaigns: 'キャンペーン',
      templates: 'テンプレート',
      newCampaign: '新しいキャンペーン',
      sendEmail: 'メール送信',
      emailsSent: '送信済みメール',
      openRate: '開封率'
    },
    roles: {
      admin: '管理者',
      teacher: '教師',
      parent: '保護者',
      student: '生徒',
      superAdmin: 'スーパー管理者'
    },
    time: {
      today: '今日',
      yesterday: '昨日',
      daysAgo: '{n}日前',
      hoursAgo: '{n}時間前',
      minutesAgo: '{n}分前',
      justNow: 'たった今'
    }
  }
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.es;
}
