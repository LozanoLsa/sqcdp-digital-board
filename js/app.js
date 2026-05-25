/* ============================================
   DMS Dashboard - Main App
   ============================================
   Orchestrates all components.
   ============================================ */

import { DataManager } from './dataManager.js';
import { LetterCalendar } from './letterCalendar.js';
import { Modal } from './modal.js';
import { ExcelExporter } from './excelExport.js';
import { PillarCharts } from './charts.js';
import { KPICards } from './kpiCards.js';
import { i18n } from './i18n.js';
import { SettingsSidebar } from './sidebar.js';
import { pillarConfigManager } from './pillarConfigManager.js';

class App {
  constructor() {
    this.dataManager = new DataManager();
    this.letterCalendars = {};
    this.modal = null;
    this.exporter = null;
    this.pillarCharts = null;
    this.kpiCards = null;
    this.sidebar = null;
  }

  // ── Initialize the app ──
  init() {
    // Apply DOM translations for static elements
    i18n.applyDOM();

    // Create settings sidebar
    this.sidebar = new SettingsSidebar();

    // Sync language button text
    this.syncLangButton();

    // Initialize data
    this.dataManager.init();

    // Create modal
    this.modal = new Modal(this.dataManager, (day, pillar) => {
      if (this.letterCalendars[pillar]) {
        this.letterCalendars[pillar].updateCell(day);
      }
      this.updateSummaryCards();
      if (this.pillarCharts) this.pillarCharts.refresh();
      if (this.kpiCards) this.kpiCards.refresh();
      this.showToast(i18n.t('toastSaved'), 'success');
    });

    // Create Excel exporter
    this.exporter = new ExcelExporter(this.dataManager);

    // Render letter calendars
    this.renderLetters();

    // Render pillar charts
    this.renderCharts();

    // Render KPI cards
    this.renderKPICards();

    // Render summary cards
    this.updateSummaryCards();

    // Setup event listeners
    this.setupEvents();

    // Update month label in header
    this.updateMonthLabel();

    // Listen for data changes (month navigation)
    this.dataManager.onChange(() => {
      this.refreshAll();
    });

    // Listen for language changes
    document.addEventListener('langchange', () => {
      i18n.applyDOM();
      this.syncLangButton();
      this.refreshAll();
      this.modal.updateButtonLabels();
      this.sidebar.refresh();
    });

    // Listen for settings (threshold) changes → re-render
    document.addEventListener('settingschange', () => {
      this.refreshAll();
    });

    // Listen for pillar config changes (visibility, name, letter, order)
    document.addEventListener('pillarConfigChange', () => {
      this.reRenderPillars();
    });

    console.log('✅ DMS Dashboard initialized');
  }

  // ── Sync the lang button text ──
  syncLangButton() {
    const btn = document.getElementById('btn-lang');
    if (btn) btn.textContent = i18n.t('btnLang');
  }

  // ── Render letter calendars (active pillars only) ──
  renderLetters() {
    const grid = document.getElementById('letters-grid');
    if (!grid) return;

    pillarConfigManager.getActiveIds().forEach((pillar) => {
      const calendar = new LetterCalendar(pillar, this.dataManager, (day, p) => {
        this.modal.open(day, p);
      });

      const element = calendar.render();
      grid.appendChild(element);
      this.letterCalendars[pillar] = calendar;
    });
  }

  // ── Update summary cards ──
  updateSummaryCards() {
    const pillars = pillarConfigManager.getActiveIds();
    let totalGreen = 0;
    let totalYellow = 0;
    let totalRed = 0;

    pillars.forEach((pillar) => {
      const stats = this.dataManager.getMonthlyStats(pillar);
      totalGreen += stats.green;
      totalYellow += stats.yellow;
      totalRed += stats.red;
    });

    const greenEl = document.getElementById('summary-green');
    const yellowEl = document.getElementById('summary-yellow');
    const redEl = document.getElementById('summary-red');
    const overallEl = document.getElementById('summary-overall');

    if (greenEl) greenEl.textContent = totalGreen;
    if (yellowEl) yellowEl.textContent = totalYellow;
    if (redEl) redEl.textContent = totalRed;

    if (overallEl) {
      const total = totalGreen + totalYellow + totalRed;
      if (total > 0) {
        const pct = Math.round((totalGreen / total) * 100);
        overallEl.textContent = `${pct}%`;
        overallEl.style.color =
          pct >= 80 ? 'var(--status-green)' :
          pct >= 50 ? 'var(--status-yellow)' :
          'var(--status-red)';
      } else {
        overallEl.textContent = '—';
      }
    }
  }

  // ── Update month label ──
  updateMonthLabel() {
    const label = document.getElementById('month-label');
    if (label) {
      label.textContent = this.dataManager.getMonthLabel();
    }
  }

  // ── Full re-render of all pillar UI (after pillarConfigChange) ──
  reRenderPillars() {
    // Tear down charts
    if (this.pillarCharts) {
      this.pillarCharts.destroy();
      this.pillarCharts = null;
    }

    // Tear down KPI cards
    if (this.kpiCards) {
      this.kpiCards.destroy?.();
      this.kpiCards = null;
    }

    // Reset letter calendars reference
    this.letterCalendars = {};

    // Clear DOM containers
    const lettersGrid = document.getElementById('letters-grid');
    if (lettersGrid) lettersGrid.innerHTML = '';

    const chartsPrimary = document.getElementById('charts-grid-primary');
    if (chartsPrimary) chartsPrimary.innerHTML = '';

    const chartsSecondary = document.getElementById('charts-grid-secondary');
    if (chartsSecondary) chartsSecondary.innerHTML = '';

    const kpiGrid = document.getElementById('kpi-cards-grid');
    if (kpiGrid) kpiGrid.innerHTML = '';

    // Re-render everything with the new active set
    this.renderLetters();
    this.renderCharts();
    this.renderKPICards();
    this.updateSummaryCards();
  }

  // ── Refresh all UI after data or language change ──
  refreshAll() {
    this.updateMonthLabel();
    Object.values(this.letterCalendars).forEach((cal) => cal.refresh());
    this.updateSummaryCards();
    if (this.pillarCharts) this.pillarCharts.refresh();
    if (this.kpiCards) this.kpiCards.refresh();
  }

  // ── Render pillar charts (primary + secondary containers) ──
  renderCharts() {
    const primary   = document.getElementById('charts-grid-primary');
    const secondary = document.getElementById('charts-grid-secondary');
    if (!primary || !secondary) return;

    this.pillarCharts = new PillarCharts(this.dataManager);
    this.pillarCharts.render(primary, secondary);
  }

  // ── Render KPI cards ──
  renderKPICards() {
    const kpiSection = document.getElementById('kpi-cards-grid');
    if (!kpiSection) return;

    this.kpiCards = new KPICards(this.dataManager);
    this.kpiCards.render(kpiSection);
  }

  // ── Setup event listeners ──
  setupEvents() {
    // Month navigation
    const prevBtn = document.getElementById('month-prev');
    const nextBtn = document.getElementById('month-next');
    if (prevBtn) prevBtn.addEventListener('click', () => this.dataManager.prevMonth());
    if (nextBtn) nextBtn.addEventListener('click', () => this.dataManager.nextMonth());

    // Settings sidebar toggle
    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.sidebar.toggle());
    }

    // Language toggle button
    const langBtn = document.getElementById('btn-lang');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        i18n.toggle();
        this.showToast(i18n.t('toastLangChanged'), 'info');
      });
    }

    // Export button
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const success = this.exporter.export();
        this.showToast(
          success ? i18n.t('toastExported') : i18n.t('toastExportError'),
          success ? 'success' : 'error',
        );
      });
    }

    // Demo data button
    const demoBtn = document.getElementById('btn-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.loadDemoData());
    }
  }

  // ── Load demo data (April 2026) ──
  async loadDemoData() {
    const hasData = Object.keys(this.dataManager.data).length > 0;
    if (hasData && !confirm(i18n.t('toastDemoConfirm'))) return;

    const { generateMockData } = await import('./mockData.js');
    this.dataManager.loadBulkData(2026, 4, generateMockData());
    this.refreshAll();
    this.showToast(i18n.t('toastDemoLoaded'), 'success');
  }

  // ── Show toast notification ──
  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--leaving');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
