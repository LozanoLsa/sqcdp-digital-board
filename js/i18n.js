/* ============================================
   DMS Dashboard - Internationalization (i18n)
   ============================================
   Central translation store. Import `i18n`
   and call i18n.t('key') anywhere.
   Language is persisted in localStorage.
   ============================================ */

const LANG_KEY = 'dms_lang';

const TRANSLATIONS = {
  en: {
    // ── Header ──
    subtitle: 'SQCDP Visual Management Board',
    btnExport: '📥 Export',
    btnExportTitle: 'Export to Excel',
    btnDemoTitle: 'Load demo data',
    btnLang: 'ES',
    navPrev: 'Previous month',
    navNext: 'Next month',

    // ── Legend ──
    legendOnTarget: 'On Target',
    legendAlert: 'Alert',
    legendOffTarget: 'Off Target',
    legendNoData: 'No Data',

    // ── Summary bar ──
    summaryOverall: 'Overall Score',
    summaryGreen: '🟩 Days On Target',
    summaryYellow: '🟨 Days on Alert',
    summaryRed: '🟥 Days Off Target',

    // ── Footer ──
    footer: 'DMS Dashboard © 2026 · Click any cell to enter data · Data saved locally in your browser',

    // ── Months ──
    months: ['', 'January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'],

    // ── Modal buttons ──
    modalClear: '🗑️ Clear',
    modalCancel: 'Cancel',
    modalSave: '💾 Save',
    modalStatusPlaceholder: 'Enter values to preview status',
    modalStatusPrefix: 'Status:',
    modalDayPrefix: 'Day',
    modalSelectCategory: '— Select category —',
    modalAddCategory: '➕ Add category',
    modalRemoveCategory: '🗑️ Remove selected',
    modalCategoryPrompt: 'New category name:',
    modalCategoryExists: 'Category already exists.',
    modalCategoryConfirm: 'Remove category "{name}"?',

    // ── Status labels (modal preview) ──
    statusGreen: '✅ ON TARGET',
    statusYellow: '⚠️ ALERT',
    statusRed: '❌ OFF TARGET',
    statusNodata: '⬜ Not enough data',
    statusGrey: '⬜ No data',

    // ── Form fields — Safety ──
    safetyIncidents: 'Incidents',
    safetyIncidentsPlaceholder: '0',
    safetyType: 'Incident type',
    safetyTypeOptions: ['', 'Near miss', 'First aid', 'Recordable', 'Lost time', 'Other'],
    safetyNotes: 'Notes / Description',
    safetyNotesPlaceholder: 'Describe the incident...',
    safetyIncidentsHint: '🟩 0 = Green | 🟥 ≥1 = Red',

    // ── Form fields — Quality ──
    qualityScrapPct: 'Daily scrap (%)',
    qualityHasAlert: 'Quality alert?',
    qualityHasAlertOptions: [
      { value: '', text: '— Select —' },
      { value: 'no', text: 'No — No alerts' },
      { value: 'yes', text: 'Yes — Log alert' },
    ],
    qualityAlertType: 'Alert type',
    qualityAlertTypeOptions: [
      { value: 'internal', text: '🏭 Internal (scrap / rework)' },
      { value: 'external', text: '📦 External (customer complaint)' },
    ],
    qualityAlertCount: 'Number of alerts',
    qualityCategory: 'Category',
    qualityDescription: 'Description',
    qualityDescriptionPlaceholder: 'Alert details...',
    qualityHasAlertHint: '🟩 No = Green | 🟨 Internal = Yellow | 🟥 External = Red',

    // ── Form fields — Cost ──
    costSectionOEE: '⚙️ Efficiency',
    costOEE: 'Daily OEE (%)',
    costSectionMaint: '🔧 Maintenance',
    costFailures: 'Number of failures',
    costRepairTime: 'Total repair time (min)',
    costEquipment: 'Equipment affected',
    costEquipmentPlaceholder: 'e.g. Press #3, Robot L2...',
    costNotes: 'Notes',
    costNotesPlaceholder: 'Failure or maintenance details...',
    costOEEHint: '🟩 ≥85% = Green | 🟨 65–85% = Yellow | 🟥 <65% = Red',

    // ── Form fields — Delivery ──
    deliveryTotal: 'Scheduled orders',
    deliveryTotalPlaceholder: '200',
    deliveryCompleted: 'Completed orders',
    deliveryCompletedPlaceholder: '0',
    deliveryBacklog: 'Backlog orders',
    deliveryNotes: 'Notes',
    deliveryNotesPlaceholder: 'Delivery comments...',
    deliveryCompletedHint: '🟩 ≥95% | 🟨 85–95% | 🟥 <85% (vs scheduled)',

    // ── Form fields — People ──
    peoplePresent: 'Headcount present',
    peoplePresentPlaceholder: '0',
    peopleTotal: 'Total headcount',
    peopleTotalPlaceholder: '48',
    peopleTraining: 'Training hours',
    peopleKaizen: 'Kaizen suggestions',
    peopleNotes: 'Notes',
    peopleNotesPlaceholder: 'HR topics, training...',
    peoplePresentHint: '🟩 ≥95% | 🟨 90–95% | 🟥 <90%',

    // ── Charts ──
    chartSafety: 'Daily Incidents',
    chartQuality: 'Quality Alerts',
    chartCost: 'Daily OEE %',
    chartDelivery: 'Delivery Fulfillment %',
    chartPeople: 'Daily Attendance %',
    chartYIncidents: 'Incidents',
    chartYAlerts: 'Alerts',
    chartTarget85: 'Target (≥85%)',
    chartAlert65: 'Alert (≥65%)',
    chartTarget95: 'Target (≥95%)',
    chartMttrGreen:      'MTTR Target (≤ min)',
    chartMttrYellow:     'MTTR Alert (≤ min)',
    chartScrapGreen:     'Scrap Target (≤%)',
    chartScrapYellow:    'Scrap Alert (≤%)',
    chartBacklogMax:     'Max Backlog',
    chartTrainingTarget: 'Training Target (h)',
    // Secondary KPI series labels
    chartSecSafetyDWA:       'Acc-Free Days',
    chartSecQualityScrap:    '% Scrap',
    chartSecCostMTTR:        'MTTR (min)',
    chartSecDeliveryBacklog: 'Backlog',
    chartSecPeopleTraining:  'Training (h)',

    // ── KPI labels ──
    kpiAccidentFree: 'Accident-Free Days',
    kpiIncidents: 'Monthly Incidents',
    kpiInternalAlerts: 'Internal Alerts',
    kpiExternalAlerts: 'External Alerts',
    kpiAvgOEE: 'Average OEE',
    kpiMTTR: 'MTTR (min)',
    kpiAdherence: 'Avg. Adherence',
    kpiBacklog: 'Current Backlog',
    kpiTraining: 'Training Hrs',
    kpiKaizen: 'Kaizen Suggestions',

    // ── Data summary tooltips ──
    dataNoData: 'No data',
    dataSafetyOk: '✅ 0 incidents',
    dataQualityOk: '✅ No alerts',
    dataQualityExternal: 'EXTERNAL',
    dataQualityInternal: 'Internal',
    dataQualityAlerts: 'alert(s)',
    dataCostFailures: 'Failures',
    dataCostMTTR: 'MTTR',
    dataDeliveryBacklog: 'Backlog',
    dataPeopleTraining: 'Training',

    // ── Toast messages ──
    toastSaved: '✅ Data saved',
    toastExported: '📥 Excel exported successfully',
    toastExportError: '❌ Export error',
    toastDemoLoaded: '📊 Demo data loaded — April 2026',
    toastDemoConfirm: 'Replace current data with demo data?',
    toastLangChanged: '🌐 Language: English',

    // ── Pillar full names ──
    pillarSafety: 'Safety',
    pillarQuality: 'Quality',
    pillarCost: 'Cost',
    pillarDelivery: 'Delivery',
    pillarPeople: 'People',

    // ── Tooltip prefix ──
    tooltipDay: 'Day',

    // ── Excel ──
    excelSummarySheet: 'DMS Summary',
    excelDay: 'Day',
    excelStatus: 'Status',

    // ── Default categories ──
    defaultCategories: ['Dimensional', 'Visual', 'Functional', 'Material', 'Process'],

    // ── Excel — Monthly Summary sheet ──
    excelMonthlySheet: 'Monthly Summary',
    excelKPI:           'Indicator',
    excelValue:         'Value',
    excelPeriod:        'Period',
    excelTotalIncidents: 'Total Incidents',
    excelIncidentDays:   'Days with Incidents',
    excelAlertDays:      'Days with Alerts',
    excelAvgOEE:         'Avg OEE %',
    excelTotalFailures:  'Total Failures',
    excelAvgMTTR:        'Avg MTTR (min)',
    excelAvgFulfillment: 'Avg Fulfillment %',
    excelBacklog:        'Current Backlog',
    excelAvgAttendance:  'Avg Attendance %',
    excelTotalTraining:  'Total Training Hrs',
    excelTotalKaizen:    'Total Kaizen',

    // ── Settings Sidebar — Pillars section ──
    sidebarPillarsTitle:  'Pillars',
    sidebarPillarName:    'Name',
    sidebarPillarLetter:  'Letter',
    sidebarResetPillars:  '↩ Reset Pillars',
    sidebarAtLeastOne:    'At least one pillar must remain visible.',

    // ── Settings Sidebar — KPI Targets ──
    sidebarTitle: 'KPI Targets',
    sidebarReset: '↩ Reset to Defaults',
    // Safety
    sidebarSafetyAccFreeGreen:  'Acc-Free Days (Green ≥)',
    sidebarSafetyAccFreeYellow: 'Acc-Free Days (Yellow ≥)',
    // Quality
    sidebarQualityScrapGreen:   'Scrap % (Green ≤)',
    sidebarQualityScrapYellow:  'Scrap % (Yellow ≤)',
    // Cost
    sidebarCostOEEGreen:   'OEE % (Green ≥)',
    sidebarCostOEEYellow:  'OEE % (Yellow ≥)',
    sidebarCostMTTRGreen:  'MTTR min (Green ≤)',
    sidebarCostMTTRYellow: 'MTTR min (Yellow ≤)',
    // Delivery
    sidebarDeliveryGreen:      'Fulfillment % (Green ≥)',
    sidebarDeliveryYellow:     'Fulfillment % (Yellow ≥)',
    sidebarDeliveryBacklogMax: 'Max Backlog (acceptable)',
    // People
    sidebarPeopleGreen:          'Attendance % (Green ≥)',
    sidebarPeopleYellow:         'Attendance % (Yellow ≥)',
    sidebarPeopleTrainingTarget: 'Training Target (hrs/day)',
    btnSettings: 'KPI Targets',
  },

  es: {
    // ── Header ──
    subtitle: 'Tablero de Gestión Visual SQCDP',
    btnExport: '📥 Exportar',
    btnExportTitle: 'Exportar a Excel',
    btnDemoTitle: 'Cargar datos de demostración',
    btnLang: 'EN',
    navPrev: 'Mes anterior',
    navNext: 'Mes siguiente',

    // ── Legend ──
    legendOnTarget: 'Meta cumplida',
    legendAlert: 'Alerta',
    legendOffTarget: 'Fuera de meta',
    legendNoData: 'Sin datos',

    // ── Summary bar ──
    summaryOverall: 'Score General',
    summaryGreen: '🟩 Días en Meta',
    summaryYellow: '🟨 Días en Alerta',
    summaryRed: '🟥 Días Fuera de Meta',

    // ── Footer ──
    footer: 'DMS Dashboard © 2026 · Click en cualquier celda para ingresar datos · Datos guardados localmente en su navegador',

    // ── Months ──
    months: ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],

    // ── Modal buttons ──
    modalClear: '🗑️ Limpiar',
    modalCancel: 'Cancelar',
    modalSave: '💾 Guardar',
    modalStatusPlaceholder: 'Ingresa valores para ver el estado',
    modalStatusPrefix: 'Estado:',
    modalDayPrefix: 'Día',
    modalSelectCategory: '— Seleccionar categoría —',
    modalAddCategory: '➕ Agregar categoría',
    modalRemoveCategory: '🗑️ Eliminar seleccionada',
    modalCategoryPrompt: 'Nombre de la nueva categoría:',
    modalCategoryExists: 'La categoría ya existe.',
    modalCategoryConfirm: '¿Eliminar la categoría "{name}"?',

    // ── Status labels (modal preview) ──
    statusGreen: '✅ META CUMPLIDA',
    statusYellow: '⚠️ ALERTA',
    statusRed: '❌ FUERA DE META',
    statusNodata: '⬜ Sin datos suficientes',
    statusGrey: '⬜ Sin datos',

    // ── Form fields — Safety ──
    safetyIncidents: 'Incidentes',
    safetyIncidentsPlaceholder: '0',
    safetyType: 'Tipo de incidente',
    safetyTypeOptions: ['', 'Near miss', 'First aid', 'Recordable', 'Lost time', 'Otro'],
    safetyNotes: 'Notas / Descripción',
    safetyNotesPlaceholder: 'Descripción del incidente...',
    safetyIncidentsHint: '🟩 0 = Verde | 🟥 ≥1 = Rojo',

    // ── Form fields — Quality ──
    qualityScrapPct: 'Scrap del día (%)',
    qualityHasAlert: '¿Hubo alerta de calidad?',
    qualityHasAlertOptions: [
      { value: '', text: '— Seleccionar —' },
      { value: 'no', text: 'No — Sin alertas' },
      { value: 'yes', text: 'Sí — Registrar alerta' },
    ],
    qualityAlertType: 'Tipo de alerta',
    qualityAlertTypeOptions: [
      { value: 'internal', text: '🏭 Interna (scrap / retrabajo)' },
      { value: 'external', text: '📦 Externa (reclamo de cliente)' },
    ],
    qualityAlertCount: 'Cantidad de alertas',
    qualityCategory: 'Categoría',
    qualityDescription: 'Descripción',
    qualityDescriptionPlaceholder: 'Detalle de la alerta...',
    qualityHasAlertHint: '🟩 No = Verde | 🟨 Interna = Amarillo | 🟥 Externa = Rojo',

    // ── Form fields — Cost ──
    costSectionOEE: '⚙️ Eficiencia',
    costOEE: 'OEE del día (%)',
    costSectionMaint: '🔧 Mantenimiento',
    costFailures: 'Número de fallas',
    costRepairTime: 'Tiempo total reparación (min)',
    costEquipment: 'Equipo afectado',
    costEquipmentPlaceholder: 'Ej: Prensa #3, Robot L2...',
    costNotes: 'Notas',
    costNotesPlaceholder: 'Detalles de falla o mantenimiento...',
    costOEEHint: '🟩 ≥85% = Verde | 🟨 65–85% = Amarillo | 🟥 <65% = Rojo',

    // ── Form fields — Delivery ──
    deliveryTotal: 'Órdenes programadas',
    deliveryTotalPlaceholder: '200',
    deliveryCompleted: 'Órdenes completadas',
    deliveryCompletedPlaceholder: '0',
    deliveryBacklog: 'Órdenes atrasadas (backlog)',
    deliveryNotes: 'Notas',
    deliveryNotesPlaceholder: 'Comentarios sobre entregas...',
    deliveryCompletedHint: '🟩 ≥95% | 🟨 85–95% | 🟥 <85% (vs programadas)',

    // ── Form fields — People ──
    peoplePresent: 'Personal presente',
    peoplePresentPlaceholder: '0',
    peopleTotal: 'Plantilla total',
    peopleTotalPlaceholder: '48',
    peopleTraining: 'Horas de capacitación',
    peopleKaizen: 'Sugerencias Kaizen',
    peopleNotes: 'Notas',
    peopleNotesPlaceholder: 'Temas de personal, capacitación...',
    peoplePresentHint: '🟩 ≥95% | 🟨 90–95% | 🟥 <90%',

    // ── Charts ──
    chartSafety: 'Incidentes por Día',
    chartQuality: 'Alertas de Calidad',
    chartCost: 'OEE % Diario',
    chartDelivery: '% Cumplimiento Entregas',
    chartPeople: '% Asistencia Diaria',
    chartYIncidents: 'Incidentes',
    chartYAlerts: 'Alertas',
    chartTarget85: 'Meta (≥85%)',
    chartAlert65: 'Alerta (≥65%)',
    chartTarget95: 'Meta (≥95%)',
    chartMttrGreen:      'MTTR Meta (≤ min)',
    chartMttrYellow:     'MTTR Alerta (≤ min)',
    chartScrapGreen:     'Meta Scrap (≤%)',
    chartScrapYellow:    'Alerta Scrap (≤%)',
    chartBacklogMax:     'Backlog Máx.',
    chartTrainingTarget: 'Meta Entrenamiento (h)',
    // Secondary KPI series labels
    chartSecSafetyDWA:       'Días s/acc.',
    chartSecQualityScrap:    '% Scrap',
    chartSecCostMTTR:        'MTTR (min)',
    chartSecDeliveryBacklog: 'Backlog',
    chartSecPeopleTraining:  'Entrenamiento (h)',

    // ── KPI labels ──
    kpiAccidentFree: 'Días sin accidentes',
    kpiIncidents: 'Incidentes del mes',
    kpiInternalAlerts: 'Alertas Internas',
    kpiExternalAlerts: 'Alertas Externas',
    kpiAvgOEE: 'OEE Promedio',
    kpiMTTR: 'MTTR (min)',
    kpiAdherence: 'Adherencia Prom.',
    kpiBacklog: 'Backlog Actual',
    kpiTraining: 'Hrs Capacitación',
    kpiKaizen: 'Sugerencias Kaizen',

    // ── Data summary tooltips ──
    dataNoData: 'Sin datos',
    dataSafetyOk: '✅ 0 incidentes',
    dataQualityOk: '✅ Sin alertas',
    dataQualityExternal: 'EXTERNA',
    dataQualityInternal: 'Interna',
    dataQualityAlerts: 'alerta(s)',
    dataCostFailures: 'Fallas',
    dataCostMTTR: 'MTTR',
    dataDeliveryBacklog: 'Backlog',
    dataPeopleTraining: 'Capacitación',

    // ── Toast messages ──
    toastSaved: '✅ Datos guardados',
    toastExported: '📥 Excel exportado correctamente',
    toastExportError: '❌ Error al exportar',
    toastDemoLoaded: '📊 Datos demo cargados — Abril 2026',
    toastDemoConfirm: '¿Reemplazar los datos actuales con datos de demostración?',
    toastLangChanged: '🌐 Idioma: Español',

    // ── Pillar full names ──
    pillarSafety: 'Seguridad',
    pillarQuality: 'Calidad',
    pillarCost: 'Costo',
    pillarDelivery: 'Entrega',
    pillarPeople: 'Personas',

    // ── Tooltip prefix ──
    tooltipDay: 'Día',

    // ── Excel ──
    excelSummarySheet: 'DMS Resumen',
    excelDay: 'Día',
    excelStatus: 'Estado',

    // ── Default categories ──
    defaultCategories: ['Dimensional', 'Visual', 'Funcional', 'Material', 'Proceso'],

    // ── Excel — hoja Resumen Mensual ──
    excelMonthlySheet: 'Resumen Mensual',
    excelKPI:           'Indicador',
    excelValue:         'Valor',
    excelPeriod:        'Período',
    excelTotalIncidents: 'Incidentes totales',
    excelIncidentDays:   'Días con incidentes',
    excelAlertDays:      'Días con alertas',
    excelAvgOEE:         'OEE % Promedio',
    excelTotalFailures:  'Fallas totales',
    excelAvgMTTR:        'MTTR Prom. (min)',
    excelAvgFulfillment: '% Cumplimiento Prom.',
    excelBacklog:        'Backlog Actual',
    excelAvgAttendance:  '% Asistencia Prom.',
    excelTotalTraining:  'Horas Capacitación',
    excelTotalKaizen:    'Total Kaizen',

    // ── Settings Sidebar — sección Pilares ──
    sidebarPillarsTitle:  'Pilares',
    sidebarPillarName:    'Nombre',
    sidebarPillarLetter:  'Letra',
    sidebarResetPillars:  '↩ Restaurar Pilares',
    sidebarAtLeastOne:    'Debe haber al menos un pilar visible.',

    // ── Settings Sidebar — Metas KPI ──
    sidebarTitle: 'Metas KPI',
    sidebarReset: '↩ Restaurar valores',
    // Safety
    sidebarSafetyAccFreeGreen:  'Días sin acc. (Verde ≥)',
    sidebarSafetyAccFreeYellow: 'Días sin acc. (Amarillo ≥)',
    // Quality
    sidebarQualityScrapGreen:   'Scrap % (Verde ≤)',
    sidebarQualityScrapYellow:  'Scrap % (Amarillo ≤)',
    // Cost
    sidebarCostOEEGreen:   'OEE % (Verde ≥)',
    sidebarCostOEEYellow:  'OEE % (Amarillo ≥)',
    sidebarCostMTTRGreen:  'MTTR min (Verde ≤)',
    sidebarCostMTTRYellow: 'MTTR min (Amarillo ≤)',
    // Delivery
    sidebarDeliveryGreen:      '% Cumplimiento (Verde ≥)',
    sidebarDeliveryYellow:     '% Cumplimiento (Amarillo ≥)',
    sidebarDeliveryBacklogMax: 'Backlog máx. aceptable',
    // People
    sidebarPeopleGreen:          '% Asistencia (Verde ≥)',
    sidebarPeopleYellow:         '% Asistencia (Amarillo ≥)',
    sidebarPeopleTrainingTarget: 'Meta entrena. (hrs/día)',
    btnSettings: 'Metas KPI',
  },
};

class I18n {
  constructor() {
    this._lang = localStorage.getItem(LANG_KEY) || 'en';
  }

  t(key) {
    return TRANSLATIONS[this._lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  }

  getLang() { return this._lang; }

  setLang(lang) {
    if (lang === this._lang || !TRANSLATIONS[lang]) return;
    this._lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  toggle() {
    this.setLang(this._lang === 'en' ? 'es' : 'en');
  }

  // Update all [data-i18n] elements in the DOM
  applyDOM() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = this.t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
  }
}

const i18n = new I18n();
export { i18n };
