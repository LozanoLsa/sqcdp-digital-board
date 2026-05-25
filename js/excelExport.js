/* ============================================
   DMS Dashboard - Excel Export
   ============================================
   Uses SheetJS (xlsx) loaded from CDN to
   generate a .xlsx file from the dashboard data.

   Sheet order:
     1. Monthly Summary  — KPI aggregates per pillar
     2. Safety detail    — daily rows
     3. Quality detail
     4. Cost detail
     5. Delivery detail
     6. People detail
   ============================================ */

import { i18n } from './i18n.js';
import { pillarConfigManager } from './pillarConfigManager.js';

class ExcelExporter {
  constructor(dataManager) {
    this.dm = dataManager;
  }

  // ── Short month abbreviation, e.g. "Apr" or "Abr" ──
  _monthAbbr() {
    return this.dm.getMonthLabel().split(' ')[0].slice(0, 3);
  }

  // ── Date label for a day: "Apr 1" ──
  _dateLabel(day) {
    return `${this._monthAbbr()} ${day}`;
  }

  // ── Main export entry point ──
  export() {
    if (typeof XLSX === 'undefined') {
      console.error('SheetJS not loaded.');
      return false;
    }

    try {
      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Monthly Summary ──
      const summaryAoa = this._buildMonthlySummary();
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
      this._setColWidths(wsSummary, [32, 18]);
      XLSX.utils.book_append_sheet(wb, wsSummary, i18n.t('excelMonthlySheet'));

      // ── Sheets 2–N: Per-pillar detail (active pillars only) ──
      const pillarNameKeys = {
        safety:   'pillarSafety',
        quality:  'pillarQuality',
        cost:     'pillarCost',
        delivery: 'pillarDelivery',
        people:   'pillarPeople',
      };

      pillarConfigManager.getActiveIds().forEach((pillar) => {
        const rows = this._buildPillarSheet(pillar);
        const ws = XLSX.utils.json_to_sheet(rows);
        this._autoColWidths(ws, rows);
        // Use custom name if set, else i18n default
        const sheetName = pillarConfigManager.getName(pillar).slice(0, 31); // Excel max 31 chars
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // ── Filename ──
      const monthLabel = this.dm.getMonthLabel().replace(' ', '_');
      XLSX.writeFile(wb, `DMS_${monthLabel}.xlsx`);
      return true;
    } catch (err) {
      console.error('Export error:', err);
      return false;
    }
  }

  // ── Build Monthly Summary as array-of-arrays ──
  _buildMonthlySummary() {
    const t  = (k) => i18n.t(k);
    const dm = this.dm;

    const safetyStats   = dm.getMonthlyStats('safety');
    const qualityStats  = dm.getMonthlyStats('quality');
    const costStats     = dm.getMonthlyStats('cost');
    const delivStats    = dm.getMonthlyStats('delivery');
    const peopleStats   = dm.getMonthlyStats('people');

    const alertsSummary = dm.getQualityAlertsSummary();
    const oeeStats      = dm.getOEEStats();
    const delivKPI      = dm.getDeliveryStats();
    const peopleKPI     = dm.getPeopleStats();

    // Count total incidents from daily data
    const daysInMonth = dm.getDaysInMonth();
    let totalIncidents = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const data = dm.getDayData(d, 'safety');
      if (data && data.incidents) totalIncidents += Number(data.incidents);
    }

    const period = dm.getMonthLabel();
    const kpiCol = t('excelKPI');
    const valCol = t('excelValue');

    const rows = [
      // Header
      [t('excelPeriod'), period],
      [],
      [kpiCol, valCol],

      // ── Safety ──
      [`🛡️ ${t('pillarSafety').toUpperCase()}`],
      [t('kpiAccidentFree'),   dm.getDaysWithoutAccidents()],
      [t('excelTotalIncidents'), totalIncidents],
      [t('excelIncidentDays'),   safetyStats.red],
      [],

      // ── Quality ──
      [`🔵 ${t('pillarQuality').toUpperCase()}`],
      [t('kpiInternalAlerts'), alertsSummary.internal],
      [t('kpiExternalAlerts'), alertsSummary.external],
      [t('excelAlertDays'),    qualityStats.yellow + qualityStats.red],
      [],

      // ── Cost ──
      [`🟠 ${t('pillarCost').toUpperCase()}`],
      [t('excelAvgOEE'),       oeeStats.avgOEE === '—' ? '—' : `${oeeStats.avgOEE}%`],
      [t('excelTotalFailures'),oeeStats.totalFailures],
      [t('excelAvgMTTR'),      oeeStats.mttr === '—' ? '—' : `${oeeStats.mttr} min`],
      [],

      // ── Delivery ──
      [`🚚 ${t('pillarDelivery').toUpperCase()}`],
      [t('excelAvgFulfillment'), delivKPI.avgAdherence === '—' ? '—' : `${delivKPI.avgAdherence}%`],
      [t('excelBacklog'),        delivKPI.totalBacklog],
      [],

      // ── People ──
      [`👥 ${t('pillarPeople').toUpperCase()}`],
      [t('excelAvgAttendance'), (() => {
        // compute avg attendance from daily data
        let sum = 0; let cnt = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const data = dm.getDayData(d, 'people');
          if (data && data.present && data.total) {
            sum += (Number(data.present) / Number(data.total)) * 100;
            cnt++;
          }
        }
        return cnt > 0 ? `${(sum / cnt).toFixed(1)}%` : '—';
      })()],
      [t('excelTotalTraining'), `${peopleKPI.totalTraining}h`],
      [t('excelTotalKaizen'),    peopleKPI.totalKaizen],
    ];

    return rows;
  }

  // ── Build one pillar's daily detail rows ──
  _buildPillarSheet(pillar) {
    const daysInMonth = this.dm.getDaysInMonth();
    const dayCol    = i18n.t('excelDay');
    const dateCol   = i18n.t('excelPeriod');
    const statusCol = i18n.t('excelStatus');
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const data   = this.dm.getDayData(day, pillar);
      const status = this.dm.getStatus(day, pillar);

      const row = {
        [dayCol]:    day,
        [dateCol]:   this._dateLabel(day),
        [statusCol]: status.toUpperCase(),
      };

      if (data) {
        switch (pillar) {
          case 'safety':
            row[i18n.t('safetyIncidents')] = data.incidents ?? '';
            row[i18n.t('safetyType')]      = data.type || '';
            row[i18n.t('safetyNotes')]     = data.notes || '';
            break;

          case 'quality':
            row[i18n.t('qualityScrapPct')]   = data.scrapPct ?? '';
            row[i18n.t('qualityHasAlert')]    = data.hasAlert || '';
            row[i18n.t('qualityAlertType')]   = data.alertType || '';
            row[i18n.t('qualityAlertCount')]  = data.alertCount || '';
            row[i18n.t('qualityCategory')]    = data.category || '';
            row[i18n.t('qualityDescription')] = data.description || '';
            break;

          case 'cost':
            row[i18n.t('costOEE')]        = data.oee ?? '';
            row[i18n.t('costFailures')]   = data.failures || 0;
            row[i18n.t('costRepairTime')] = data.repairTime || 0;
            row[i18n.t('costEquipment')]  = data.equipment || '';
            row[i18n.t('costNotes')]      = data.notes || '';
            break;

          case 'delivery': {
            const pct = data.total > 0
              ? `${((data.completed / data.total) * 100).toFixed(1)}%`
              : '';
            row[i18n.t('deliveryCompleted')] = data.completed ?? '';
            row[i18n.t('deliveryTotal')]     = data.total ?? '';
            row['%']                          = pct;
            row[i18n.t('deliveryBacklog')]   = data.backlog ?? '';
            row[i18n.t('deliveryNotes')]     = data.notes || '';
            break;
          }

          case 'people': {
            const pct = data.total > 0
              ? `${((data.present / data.total) * 100).toFixed(1)}%`
              : '';
            row[i18n.t('peoplePresent')]   = data.present ?? '';
            row[i18n.t('peopleTotal')]     = data.total ?? '';
            row['%']                        = pct;
            row[i18n.t('peopleTraining')]  = data.trainingHrs || 0;
            row[i18n.t('peopleKaizen')]    = data.kaizen || 0;
            row[i18n.t('peopleNotes')]     = data.notes || '';
            break;
          }
        }
      }

      rows.push(row);
    }

    return rows;
  }

  // ── Fixed column widths for AOA sheets ──
  _setColWidths(ws, widths) {
    ws['!cols'] = widths.map((w) => ({ wch: w }));
  }

  // ── Auto column widths from JSON rows ──
  _autoColWidths(ws, rows) {
    if (!rows.length) return;
    ws['!cols'] = Object.keys(rows[0]).map((k) => ({
      wch: Math.max(k.length + 2, 12),
    }));
  }
}

export { ExcelExporter };
