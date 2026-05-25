import { i18n } from './i18n.js';
import { settingsManager } from './settingsManager.js';
import { pillarConfigManager } from './pillarConfigManager.js';

/* ============================================
   DMS Dashboard - Pillar Charts
   ============================================
   Row 1 — Primary KPI: main operational metric
   Row 2 — Secondary KPI: supporting standard KPI
   Both rows render 5 individual chart cards
   (one per active pillar).
   ============================================ */

// ── Row 1: Primary KPI per pillar ──
function getChartConfig() {
  return {
    safety: {
      label: pillarConfigManager.getName('safety'),
      title: i18n.t('chartSafety'),
      type: 'bar',
      color: '#27ae60',
      colorLight: 'rgba(39,174,96,0.15)',
      extract: (data) => (data ? (Number(data.incidents) || 0) : null),
      yLabel: i18n.t('chartYIncidents'),
      suggestedMax: 5,
    },
    quality: {
      label: pillarConfigManager.getName('quality'),
      title: i18n.t('chartQuality'),
      type: 'bar',
      color: '#3498db',
      colorLight: 'rgba(52,152,219,0.15)',
      extract: (data) => {
        if (!data || !data.hasAlert || data.hasAlert === '') return null;
        if (data.hasAlert === 'no') return 0;
        return Number(data.alertCount) || 1;
      },
      yLabel: i18n.t('chartYAlerts'),
      suggestedMax: 5,
    },
    cost: {
      label: pillarConfigManager.getName('cost'),
      title: i18n.t('chartCost'),
      type: 'line',
      color: '#e67e22',
      colorLight: 'rgba(230,126,34,0.12)',
      extract: (data) => (data && data.oee !== undefined && data.oee !== '' ? Number(data.oee) : null),
      yLabel: '%',
      suggestedMax: 105,
      thresholds: [
        { valueKey: ['cost', 'oeeGreen'],  color: 'rgba(46,204,113,0.12)', labelKey: 'chartTarget85' },
        { valueKey: ['cost', 'oeeYellow'], color: 'rgba(241,196,15,0.12)', labelKey: 'chartAlert65' },
      ],
    },
    delivery: {
      label: pillarConfigManager.getName('delivery'),
      title: i18n.t('chartDelivery'),
      type: 'bar',
      color: '#2471a3',
      colorLight: 'rgba(36,113,163,0.15)',
      extract: (data) => {
        if (!data || !data.completed || !data.total) return null;
        return ((data.completed / data.total) * 100).toFixed(1);
      },
      yLabel: '%',
      suggestedMax: 105,
      thresholds: [
        { valueKey: ['delivery', 'green'], color: 'rgba(46,204,113,0.12)', labelKey: 'chartTarget95' },
      ],
    },
    people: {
      label: pillarConfigManager.getName('people'),
      title: i18n.t('chartPeople'),
      type: 'line',
      color: '#8e44ad',
      colorLight: 'rgba(142,68,173,0.15)',
      extract: (data) => {
        if (!data || !data.present || !data.total) return null;
        return ((data.present / data.total) * 100).toFixed(1);
      },
      yLabel: '%',
      suggestedMax: 105,
      thresholds: [
        { valueKey: ['people', 'green'], color: 'rgba(46,204,113,0.12)', labelKey: 'chartTarget95' },
      ],
    },
  };
}

// ── Row 2: Secondary KPI per pillar (world-standard manufacturing KPIs) ──
function getSecondaryChartConfig() {
  return {
    // Safety → DWA: accumulated accident-free day streak
    safety: {
      label: pillarConfigManager.getName('safety'),
      title: i18n.t('chartSecSafetyDWA'),
      type: 'line',
      color: '#16a085',
      colorLight: 'rgba(22,160,133,0.12)',
      computeSeries: (dm, days) => {
        let streak = 0;
        return Array.from({ length: days }, (_, i) => {
          const d = dm.getDayData(i + 1, 'safety');
          if (!d) return null;
          streak = (Number(d.incidents) || 0) > 0 ? 0 : streak + 1;
          return streak;
        });
      },
      yLabel: i18n.t('chartSecSafetyDWA'),
      suggestedMax: 31,
    },
    // Quality → % Scrap
    quality: {
      label: pillarConfigManager.getName('quality'),
      title: i18n.t('chartSecQualityScrap'),
      type: 'line',
      color: '#c0392b',
      colorLight: 'rgba(192,57,43,0.1)',
      computeSeries: (dm, days) =>
        Array.from({ length: days }, (_, i) => {
          const d = dm.getDayData(i + 1, 'quality');
          return (d && d.scrapPct !== undefined && d.scrapPct !== '')
            ? Number(d.scrapPct) : null;
        }),
      yLabel: '%',
      suggestedMax: 20,
      thresholds: [
        { valueKey: ['quality', 'scrapGreen'],  color: 'rgba(46,204,113,0.12)', labelKey: 'chartScrapGreen' },
        { valueKey: ['quality', 'scrapYellow'], color: 'rgba(241,196,15,0.12)',  labelKey: 'chartScrapYellow' },
      ],
    },
    // Cost → MTTR (Mean Time To Repair, minutes)
    cost: {
      label: pillarConfigManager.getName('cost'),
      title: i18n.t('chartSecCostMTTR'),
      type: 'bar',
      color: '#e74c3c',
      colorLight: 'rgba(231,76,60,0.15)',
      computeSeries: (dm, days) =>
        Array.from({ length: days }, (_, i) => {
          const d = dm.getDayData(i + 1, 'cost');
          const v = d && Number(d.repairTime);
          return (v > 0) ? v : null;
        }),
      yLabel: 'min',
      suggestedMax: 120,
      thresholds: [
        { valueKey: ['cost', 'mttrGreen'],  color: 'rgba(46,204,113,0.12)', labelKey: 'chartMttrGreen' },
        { valueKey: ['cost', 'mttrYellow'], color: 'rgba(241,196,15,0.12)',  labelKey: 'chartMttrYellow' },
      ],
    },
    // Delivery → Backlog
    delivery: {
      label: pillarConfigManager.getName('delivery'),
      title: i18n.t('chartSecDeliveryBacklog'),
      type: 'bar',
      color: '#922b21',
      colorLight: 'rgba(146,43,33,0.12)',
      computeSeries: (dm, days) =>
        Array.from({ length: days }, (_, i) => {
          const d = dm.getDayData(i + 1, 'delivery');
          const v = d && Number(d.backlog);
          return (v > 0) ? v : null;
        }),
      yLabel: i18n.t('chartSecDeliveryBacklog'),
      thresholds: [
        { valueKey: ['delivery', 'backlogMax'], color: 'rgba(241,196,15,0.12)', labelKey: 'chartBacklogMax' },
      ],
    },
    // People → Training hours
    people: {
      label: pillarConfigManager.getName('people'),
      title: i18n.t('chartSecPeopleTraining'),
      type: 'bar',
      color: '#6c3483',
      colorLight: 'rgba(108,52,131,0.12)',
      computeSeries: (dm, days) =>
        Array.from({ length: days }, (_, i) => {
          const d = dm.getDayData(i + 1, 'people');
          const v = d && Number(d.trainingHrs);
          return (v > 0) ? v : null;
        }),
      yLabel: 'h',
      suggestedMax: 8,
      thresholds: [
        { valueKey: ['people', 'trainingTarget'], color: 'rgba(46,204,113,0.12)', labelKey: 'chartTrainingTarget' },
      ],
    },
  };
}

// ── Shared Chart.js defaults ──
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(20,20,40,0.9)',
      titleFont: { family: 'Inter', size: 11 },
      bodyFont: { family: 'Inter', size: 11 },
      padding: 8,
      cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { family: 'Inter', size: 9 },
        color: '#9ca3af',
        maxRotation: 0,
      },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        font: { family: 'Inter', size: 9 },
        color: '#9ca3af',
      },
      beginAtZero: true,
    },
  },
};

class PillarCharts {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.charts  = {};   // primary charts
    this.charts2 = {};   // secondary charts
    this.container = null;
  }

  // ── Main render: primary into one container, secondary into another ──
  render(primaryContainer, secondaryContainer) {
    const pillars = pillarConfigManager.getActiveIds();

    pillars.forEach((pillar) => {
      primaryContainer.appendChild(this._createCard(pillar, 'primary'));
      secondaryContainer.appendChild(this._createCard(pillar, 'secondary'));
    });

    this.primaryContainer   = primaryContainer;
    this.secondaryContainer = secondaryContainer;

    requestAnimationFrame(() => {
      pillars.forEach((pillar) => {
        this._renderChart(pillar, 'primary');
        this._renderChart(pillar, 'secondary');
      });
    });
  }

  // ── Build a chart card DOM element ──
  _createCard(pillar, variant) {
    const cfg = variant === 'primary'
      ? getChartConfig()[pillar]
      : getSecondaryChartConfig()[pillar];

    const primaryCfg = getChartConfig()[pillar]; // always use pillar color for badge

    const card = document.createElement('div');
    card.className = `chart-card${variant === 'secondary' ? ' chart-card--secondary' : ''}`;
    card.dataset.pillar  = pillar;
    card.dataset.variant = variant;

    // Header
    const header = document.createElement('div');
    header.className = 'chart-card__header';

    const badge = document.createElement('span');
    badge.className = 'chart-card__badge';
    badge.style.background = primaryCfg.colorLight;
    badge.style.color      = primaryCfg.color;
    badge.textContent = cfg.label;

    const title = document.createElement('span');
    title.className = 'chart-card__title';
    title.textContent = cfg.title;

    header.appendChild(badge);
    header.appendChild(title);
    card.appendChild(header);

    // Canvas
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'chart-card__canvas-wrap';
    const canvas = document.createElement('canvas');
    canvas.id = variant === 'primary' ? `chart-${pillar}` : `chart2-${pillar}`;
    canvasWrap.appendChild(canvas);
    card.appendChild(canvasWrap);

    // Border always uses the pillar's primary color for visual consistency
    card.style.borderTop = `3px solid ${primaryCfg.color}`;
    return card;
  }

  // ── Render one chart (primary or secondary) ──
  _renderChart(pillar, variant) {
    const cfg = variant === 'primary'
      ? getChartConfig()[pillar]
      : getSecondaryChartConfig()[pillar];

    const canvasId = variant === 'primary' ? `chart-${pillar}` : `chart2-${pillar}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const daysInMonth = this.dataManager.getDaysInMonth();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Build data array
    let data;
    const barColors = [];

    if (cfg.computeSeries) {
      // Secondary KPIs use a full-series compute function
      data = cfg.computeSeries(this.dataManager, daysInMonth);
    } else {
      // Primary KPIs extract day-by-day
      data = labels.map((day) => cfg.extract(this.dataManager.getDayData(day, pillar)));

      if (cfg.type === 'bar') {
        labels.forEach((day) => {
          const status = this.dataManager.getStatus(day, pillar);
          if (status === 'green')       barColors.push('#2ecc71');
          else if (status === 'yellow') barColors.push('#f1c40f');
          else if (status === 'red')    barColors.push('#e74c3c');
          else                           barColors.push('#d1d5db');
        });
      }
    }

    // Build dataset
    const datasets = [];

    if (cfg.type === 'bar') {
      datasets.push({
        label: cfg.yLabel,
        data,
        backgroundColor: barColors.length ? barColors : cfg.color,
        borderRadius: 3,
        borderSkipped: false,
        barPercentage: 0.7,
      });
    } else {
      datasets.push({
        label: cfg.yLabel || cfg.title,
        data,
        borderColor: cfg.color,
        backgroundColor: cfg.colorLight,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      });
    }

    // Chart options
    const options = JSON.parse(JSON.stringify(CHART_DEFAULTS));
    if (cfg.suggestedMax) options.scales.y.suggestedMax = cfg.suggestedMax;

    // Threshold lines (always type:line on primary axis)
    if (cfg.thresholds) {
      cfg.thresholds.forEach((th) => {
        const thValue = th.valueKey
          ? settingsManager.get(th.valueKey[0], th.valueKey[1])
          : th.value;
        datasets.push({
          label: i18n.t(th.labelKey),
          data: Array(daysInMonth).fill(thValue),
          type: 'line',
          borderColor: th.color.replace('0.12', '0.6'),
          borderDash: [4, 3],
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderWidth: 1,
        });
      });

      options.plugins.legend = {
        display: true,
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 9 },
          boxWidth: 10,
          padding: 6,
          usePointStyle: true,
        },
      };
    }

    // Destroy previous instance
    const store = variant === 'primary' ? this.charts : this.charts2;
    if (store[pillar]) store[pillar].destroy();

    store[pillar] = new Chart(canvas, {
      type: cfg.type,
      data: { labels, datasets },
      options,
    });
  }

  // ── Refresh all charts (data or language change) ──
  refresh() {
    const pillars = pillarConfigManager.getActiveIds();
    pillars.forEach((pillar) => {
      // Update header text on both variants
      ['primary', 'secondary'].forEach((variant) => {
        const container = variant === 'primary' ? this.primaryContainer : this.secondaryContainer;
        const card = container?.querySelector(
          `.chart-card[data-pillar="${pillar}"][data-variant="${variant}"]`,
        );
        if (card) {
          const cfg = variant === 'primary'
            ? getChartConfig()[pillar]
            : getSecondaryChartConfig()[pillar];
          const titleEl = card.querySelector('.chart-card__title');
          const badgeEl = card.querySelector('.chart-card__badge');
          if (titleEl) titleEl.textContent = cfg.title;
          if (badgeEl) badgeEl.textContent = cfg.label;
        }
      });
      this._renderChart(pillar, 'primary');
      this._renderChart(pillar, 'secondary');
    });
  }

  // ── Destroy all chart instances ──
  destroy() {
    [...Object.values(this.charts), ...Object.values(this.charts2)]
      .forEach((c) => c.destroy());
    this.charts  = {};
    this.charts2 = {};
  }
}

export { PillarCharts };
