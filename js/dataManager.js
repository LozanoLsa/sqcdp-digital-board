/* ============================================
   DMS Dashboard - Data Manager
   ============================================
   Handles CRUD operations and localStorage
   persistence for all SQCDP data.
   ============================================ */

import { i18n } from './i18n.js';
import { settingsManager } from './settingsManager.js';

const STORAGE_KEY = 'dms_dashboard_data';
const META_KEY = 'dms_dashboard_meta';
const CATEGORIES_KEY = 'dms_dashboard_categories';

// ── Default quality alert categories ──
const DEFAULT_CATEGORIES = ['Dimensional', 'Visual', 'Functional', 'Material', 'Process'];

// ── Threshold rules (configurable) ──
const THRESHOLDS = {
  safety: {
    // 0 incidents = green, any = red
    evaluate: (data) => {
      if (!data || data.incidents === undefined || data.incidents === '') return 'nodata';
      return Number(data.incidents) === 0 ? 'green' : 'red';
    },
    summary: (data) => {
      if (!data || data.incidents === undefined) return i18n.t('dataNoData');
      return data.incidents === 0
        ? i18n.t('dataSafetyOk')
        : `⚠️ ${data.incidents} incident(s): ${data.type || ''}`;
    },
  },
  quality: {
    evaluate: (data) => {
      if (!data || data.hasAlert === undefined || data.hasAlert === '') return 'nodata';
      if (!data.hasAlert || data.hasAlert === 'no') return 'green';
      if (data.alertType === 'external') return 'red';
      return 'yellow';
    },
    summary: (data) => {
      if (!data || data.hasAlert === undefined) return i18n.t('dataNoData');
      if (!data.hasAlert || data.hasAlert === 'no') return i18n.t('dataQualityOk');
      const type = data.alertType === 'external' ? i18n.t('dataQualityExternal') : i18n.t('dataQualityInternal');
      return `⚠️ ${data.alertCount || 1} ${i18n.t('dataQualityAlerts')} ${type}: ${data.category || ''}`;
    },
  },
  cost: {
    evaluate: (data) => {
      if (!data || data.oee === undefined || data.oee === '') return 'nodata';
      const oee = Number(data.oee);
      if (oee >= settingsManager.get('cost', 'oeeGreen'))  return 'green';
      if (oee >= settingsManager.get('cost', 'oeeYellow')) return 'yellow';
      return 'red';
    },
    summary: (data) => {
      if (!data || data.oee === undefined) return i18n.t('dataNoData');
      let text = `OEE: ${data.oee}%`;
      if (data.failures && Number(data.failures) > 0) {
        const mttr = data.repairTime && data.failures
          ? Math.round(Number(data.repairTime) / Number(data.failures)) : '—';
        text += ` | ${i18n.t('dataCostFailures')}: ${data.failures} | ${i18n.t('dataCostMTTR')}: ${mttr} min`;
      }
      return text;
    },
  },
  delivery: {
    evaluate: (data) => {
      if (!data || data.completed === undefined || data.completed === '' || data.total === undefined) return 'nodata';
      const pct = (Number(data.completed) / Number(data.total)) * 100;
      if (pct >= settingsManager.get('delivery', 'green'))  return 'green';
      if (pct >= settingsManager.get('delivery', 'yellow')) return 'yellow';
      return 'red';
    },
    summary: (data) => {
      if (!data || data.completed === undefined) return i18n.t('dataNoData');
      const pct = ((Number(data.completed) / Number(data.total)) * 100).toFixed(1);
      let text = `${data.completed}/${data.total} (${pct}%)`;
      if (data.backlog && Number(data.backlog) > 0) {
        text += ` | ${i18n.t('dataDeliveryBacklog')}: ${data.backlog}`;
      }
      return text;
    },
  },
  people: {
    evaluate: (data) => {
      if (!data || data.present === undefined || data.present === '' || data.total === undefined) return 'nodata';
      const pct = (Number(data.present) / Number(data.total)) * 100;
      if (pct >= settingsManager.get('people', 'green'))  return 'green';
      if (pct >= settingsManager.get('people', 'yellow')) return 'yellow';
      return 'red';
    },
    summary: (data) => {
      if (!data || data.present === undefined) return i18n.t('dataNoData');
      const pct = ((Number(data.present) / Number(data.total)) * 100).toFixed(1);
      let text = `${data.present}/${data.total} (${pct}%)`;
      if (data.trainingHrs) text += ` | ${i18n.t('dataPeopleTraining')}: ${data.trainingHrs}h`;
      if (data.kaizen) text += ` | Kaizen: ${data.kaizen}`;
      return text;
    },
  },
};

class DataManager {
  constructor() {
    this.data = {};
    const now = new Date();
    this.meta = {
      year: now.getFullYear(),
      month: now.getMonth() + 1, // 1-indexed
    };
    this.listeners = [];
    this.categories = [...DEFAULT_CATEGORIES];
  }

  // ── Initialize ──
  init() {
    // Load categories
    const savedCategories = localStorage.getItem(CATEGORIES_KEY);
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedMeta = localStorage.getItem(META_KEY);

    if (savedData && savedMeta) {
      const parsedData = JSON.parse(savedData);
      const parsedMeta = JSON.parse(savedMeta);

      // Use saved data if it exists
      if (Object.keys(parsedData).length > 0) {
        this.data = parsedData;
        this.meta = parsedMeta;
      }
      // Otherwise keep empty data for current month
    }
    // First visit: start blank — user enters data during the meeting
    this.save();
  }

  // ── Category management (Quality) ──
  getCategories() {
    return [...this.categories];
  }

  addCategory(name) {
    const trimmed = name.trim();
    if (trimmed && !this.categories.includes(trimmed)) {
      this.categories.push(trimmed);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
      return true;
    }
    return false;
  }

  removeCategory(name) {
    const idx = this.categories.indexOf(name);
    if (idx > -1) {
      this.categories.splice(idx, 1);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
      return true;
    }
    return false;
  }

  // ── Get current month info ──
  getMonth() {
    return this.meta.month;
  }

  getYear() {
    return this.meta.year;
  }

  getMonthName() {
    return i18n.t('months')[this.meta.month];
  }

  getMonthLabel() {
    return `${this.getMonthName()} ${this.meta.year}`;
  }

  getDaysInMonth() {
    return new Date(this.meta.year, this.meta.month, 0).getDate();
  }

  // ── Navigate months ──
  prevMonth() {
    if (this.meta.month === 1) {
      this.meta.month = 12;
      this.meta.year--;
    } else {
      this.meta.month--;
    }
    const key = `${this.meta.year}-${this.meta.month}`;
    const savedAll = localStorage.getItem(STORAGE_KEY + '_' + key);
    if (savedAll) {
      this.data = JSON.parse(savedAll);
    } else {
      this.data = {};
    }
    this.save();
    this.notify();
  }

  nextMonth() {
    if (this.meta.month === 12) {
      this.meta.month = 1;
      this.meta.year++;
    } else {
      this.meta.month++;
    }
    const key = `${this.meta.year}-${this.meta.month}`;
    const savedAll = localStorage.getItem(STORAGE_KEY + '_' + key);
    if (savedAll) {
      this.data = JSON.parse(savedAll);
    } else {
      this.data = {};
    }
    this.save();
    this.notify();
  }

  // ── Get data for a specific day & pillar ──
  getDayData(day, pillar) {
    if (!this.data[day]) return null;
    return this.data[day][pillar] || null;
  }

  // ── Get all data for a day ──
  getDay(day) {
    return this.data[day] || null;
  }

  // ── Set data for a specific day & pillar ──
  setDayData(day, pillar, values) {
    if (!this.data[day]) {
      this.data[day] = {};
    }
    this.data[day][pillar] = values;
    this.save();
    this.notify();
  }

  // ── Clear data for a specific day & pillar ──
  clearDayData(day, pillar) {
    if (this.data[day]) {
      delete this.data[day][pillar];
      if (Object.keys(this.data[day]).length === 0) {
        delete this.data[day];
      }
      this.save();
      this.notify();
    }
  }

  // ── Evaluate status color for a day/pillar ──
  getStatus(day, pillar) {
    const dayData = this.getDayData(day, pillar);
    const daysInMonth = this.getDaysInMonth();
    if (day > daysInMonth) return 'grey'; // Day doesn't exist in this month
    return THRESHOLDS[pillar].evaluate(dayData);
  }

  // ── Get summary text for a day/pillar ──
  getSummary(day, pillar) {
    const dayData = this.getDayData(day, pillar);
    return THRESHOLDS[pillar].summary(dayData);
  }

  // ── Get monthly stats for a pillar ──
  getMonthlyStats(pillar) {
    const daysInMonth = this.getDaysInMonth();
    const stats = { green: 0, yellow: 0, red: 0, nodata: 0 };
    for (let day = 1; day <= daysInMonth; day++) {
      const status = this.getStatus(day, pillar);
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    }
    return stats;
  }

  // ── KPI: Days without accidents (Safety) ──
  getDaysWithoutAccidents() {
    const daysInMonth = this.getDaysInMonth();
    let streak = 0;
    // Count backwards from last day with data
    for (let day = daysInMonth; day >= 1; day--) {
      const data = this.getDayData(day, 'safety');
      if (!data || data.incidents === undefined) continue;
      if (Number(data.incidents) === 0) {
        streak++;
      } else {
        break; // streak broken
      }
    }
    return streak;
  }

  // ── KPI: Safety incident classification ──
  getIncidentClassification() {
    const daysInMonth = this.getDaysInMonth();
    const counts = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const data = this.getDayData(day, 'safety');
      if (data && Number(data.incidents) > 0 && data.type) {
        counts[data.type] = (counts[data.type] || 0) + Number(data.incidents);
      }
    }
    return counts;
  }

  // ── KPI: Quality alerts summary ──
  getQualityAlertsSummary() {
    const daysInMonth = this.getDaysInMonth();
    let internal = 0;
    let external = 0;
    const byCategory = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const data = this.getDayData(day, 'quality');
      if (data && data.hasAlert && data.hasAlert !== 'no') {
        const count = Number(data.alertCount) || 1;
        if (data.alertType === 'external') {
          external += count;
        } else {
          internal += count;
        }
        if (data.category) {
          byCategory[data.category] = (byCategory[data.category] || 0) + count;
        }
      }
    }
    return { internal, external, byCategory };
  }

  // ── KPI: OEE & MTTR monthly averages ──
  getOEEStats() {
    const daysInMonth = this.getDaysInMonth();
    let oeeSum = 0;
    let oeeCount = 0;
    let totalRepairTime = 0;
    let totalFailures = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const data = this.getDayData(day, 'cost');
      if (data && data.oee !== undefined && data.oee !== '') {
        oeeSum += Number(data.oee);
        oeeCount++;
      }
      if (data && data.failures) {
        totalFailures += Number(data.failures);
        totalRepairTime += Number(data.repairTime) || 0;
      }
    }

    return {
      avgOEE: oeeCount > 0 ? (oeeSum / oeeCount).toFixed(1) : '—',
      mttr: totalFailures > 0 ? Math.round(totalRepairTime / totalFailures) : '—',
      totalFailures,
    };
  }

  // ── KPI: Delivery backlog & adherence ──
  getDeliveryStats() {
    const daysInMonth = this.getDaysInMonth();
    let currentBacklog = 0;
    let adherenceSum = 0;
    let adherenceCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const data = this.getDayData(day, 'delivery');
      if (data && data.backlog !== undefined) {
        currentBacklog = Number(data.backlog) || 0; // last recorded value
      }
      if (data && data.completed !== undefined && data.total) {
        const pct = (Number(data.completed) / Number(data.total)) * 100;
        adherenceSum += pct;
        adherenceCount++;
      }
    }

    return {
      totalBacklog: currentBacklog,
      avgAdherence: adherenceCount > 0 ? (adherenceSum / adherenceCount).toFixed(1) : '—',
    };
  }

  // ── KPI: People training & kaizen ──
  getPeopleStats() {
    const daysInMonth = this.getDaysInMonth();
    let totalTraining = 0;
    let totalKaizen = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const data = this.getDayData(day, 'people');
      if (data) {
        totalTraining += Number(data.trainingHrs) || 0;
        totalKaizen += Number(data.kaizen) || 0;
      }
    }

    return { totalTraining: totalTraining.toFixed(1), totalKaizen };
  }

  // ── Load bulk data (used by demo loader) ──
  loadBulkData(year, month, data) {
    this.meta = { year, month };
    this.data = data;
    this.save();
    this.notify();
  }

  // ── Save to localStorage ──
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    localStorage.setItem(META_KEY, JSON.stringify(this.meta));
    // Also save per-month for navigation
    const key = `${this.meta.year}-${this.meta.month}`;
    localStorage.setItem(STORAGE_KEY + '_' + key, JSON.stringify(this.data));
  }

  // ── Observer pattern ──
  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach((cb) => cb());
  }

  // ── Export data as flat array (for Excel) ──
  exportFlat() {
    const daysInMonth = this.getDaysInMonth();
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const row = { [i18n.t('excelDay')]: day };

      // Safety
      const sd = this.getDayData(day, 'safety');
      row['Safety_Incidents'] = sd ? sd.incidents : '';
      row['Safety_Type'] = sd ? sd.type : '';
      row['Safety_Notes'] = sd ? sd.notes : '';
      row['Safety_Status'] = this.getStatus(day, 'safety');

      // Quality
      const qd = this.getDayData(day, 'quality');
      row['Quality_Alert'] = qd ? qd.hasAlert : '';
      row['Quality_Type'] = qd ? qd.alertType : '';
      row['Quality_Count'] = qd ? qd.alertCount : '';
      row['Quality_Category'] = qd ? qd.category : '';
      row['Quality_Description'] = qd ? qd.description : '';
      row['Quality_Status'] = this.getStatus(day, 'quality');

      // Cost
      const cd = this.getDayData(day, 'cost');
      row['Cost_OEE%'] = cd ? cd.oee : '';
      row['Cost_Failures'] = cd ? cd.failures : '';
      row['Cost_RepairTime_min'] = cd ? cd.repairTime : '';
      row['Cost_Equipment'] = cd ? cd.equipment : '';
      row['Cost_Status'] = this.getStatus(day, 'cost');

      // Delivery
      const dd = this.getDayData(day, 'delivery');
      row['Delivery_Completed'] = dd ? dd.completed : '';
      row['Delivery_Scheduled'] = dd ? dd.total : '';
      row['Delivery_Backlog'] = dd ? dd.backlog : '';
      row['Delivery_Status'] = this.getStatus(day, 'delivery');

      // People
      const pd = this.getDayData(day, 'people');
      row['People_Present'] = pd ? pd.present : '';
      row['People_Headcount'] = pd ? pd.total : '';
      row['People_Training_Hrs'] = pd ? pd.trainingHrs : '';
      row['People_Kaizen'] = pd ? pd.kaizen : '';
      row['People_Status'] = this.getStatus(day, 'people');

      rows.push(row);
    }

    return rows;
  }
}

export { DataManager, THRESHOLDS };
