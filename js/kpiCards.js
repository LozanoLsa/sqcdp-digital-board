import { i18n } from './i18n.js';
import { settingsManager } from './settingsManager.js';
import { pillarConfigManager } from './pillarConfigManager.js';

/* ============================================
   DMS Dashboard - KPI Summary Cards
   ============================================
   Renders a row of KPI cards below the charts,
   showing key metrics for each SQCDP pillar.
   ============================================ */

// Returns KPI definitions evaluated at call time so labels reflect current language
function getKpiDefinitions() {
  return {
    safety: [
      {
        id: 'days-no-accidents',
        label: i18n.t('kpiAccidentFree'),
        icon: '🛡️',
        getValue: (dm) => dm.getDaysWithoutAccidents(),
        format: (v) => v,
        color: (v) => {
          const g = settingsManager.get('safety', 'accFreeGreen');
          const y = settingsManager.get('safety', 'accFreeYellow');
          return v >= g ? '#2ecc71' : v >= y ? '#f39c12' : '#e74c3c';
        },
      },
      {
        id: 'incident-types',
        label: i18n.t('kpiIncidents'),
        icon: '⚠️',
        getValue: (dm) => {
          const stats = dm.getMonthlyStats('safety');
          return stats.red;
        },
        format: (v) => v,
        color: (v) => v === 0 ? '#2ecc71' : '#e74c3c',
      },
    ],
    quality: [
      {
        id: 'alerts-internal',
        label: i18n.t('kpiInternalAlerts'),
        icon: '🏭',
        getValue: (dm) => dm.getQualityAlertsSummary().internal,
        format: (v) => v,
        color: (v) => v === 0 ? '#2ecc71' : '#f39c12',
      },
      {
        id: 'alerts-external',
        label: i18n.t('kpiExternalAlerts'),
        icon: '📦',
        getValue: (dm) => dm.getQualityAlertsSummary().external,
        format: (v) => v,
        color: (v) => v === 0 ? '#2ecc71' : '#e74c3c',
      },
    ],
    cost: [
      {
        id: 'oee-avg',
        label: i18n.t('kpiAvgOEE'),
        icon: '⚙️',
        getValue: (dm) => dm.getOEEStats().avgOEE,
        format: (v) => v === '—' ? '—' : `${v}%`,
        color: (v) => {
          if (v === '—') return '#9ca3af';
          const n = parseFloat(v);
          const g = settingsManager.get('cost', 'oeeGreen');
          const y = settingsManager.get('cost', 'oeeYellow');
          return n >= g ? '#2ecc71' : n >= y ? '#f39c12' : '#e74c3c';
        },
      },
      {
        id: 'mttr',
        label: i18n.t('kpiMTTR'),
        icon: '🔧',
        getValue: (dm) => dm.getOEEStats().mttr,
        format: (v) => v === '—' ? '—' : `${v}'`,
        color: (v) => {
          if (v === '—') return '#9ca3af';
          const n = Number(v);
          const g = settingsManager.get('cost', 'mttrGreen');
          const y = settingsManager.get('cost', 'mttrYellow');
          return n <= g ? '#2ecc71' : n <= y ? '#f39c12' : '#e74c3c';
        },
      },
    ],
    delivery: [
      {
        id: 'otd-avg',
        label: i18n.t('kpiAdherence'),
        icon: '🚚',
        getValue: (dm) => dm.getDeliveryStats().avgAdherence,
        format: (v) => v === '—' ? '—' : `${v}%`,
        color: (v) => {
          if (v === '—') return '#9ca3af';
          const n = parseFloat(v);
          const g = settingsManager.get('delivery', 'green');
          const y = settingsManager.get('delivery', 'yellow');
          return n >= g ? '#2ecc71' : n >= y ? '#f39c12' : '#e74c3c';
        },
      },
      {
        id: 'backlog',
        label: i18n.t('kpiBacklog'),
        icon: '📋',
        getValue: (dm) => dm.getDeliveryStats().totalBacklog,
        format: (v) => v,
        color: (v) => v === 0 ? '#2ecc71' : '#e74c3c',
      },
    ],
    people: [
      {
        id: 'training-hrs',
        label: i18n.t('kpiTraining'),
        icon: '🎓',
        getValue: (dm) => dm.getPeopleStats().totalTraining,
        format: (v) => `${v}h`,
        color: () => '#3498db',
      },
      {
        id: 'kaizen-count',
        label: i18n.t('kpiKaizen'),
        icon: '💡',
        getValue: (dm) => dm.getPeopleStats().totalKaizen,
        format: (v) => v,
        color: (v) => v > 0 ? '#2ecc71' : '#9ca3af',
      },
    ],
  };
}

class KPICards {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.container = null;
  }

  render(parentElement) {
    this.container = parentElement;

    pillarConfigManager.getActiveIds().forEach((pillar) => {
      const card = this.createPillarKPICard(pillar);
      parentElement.appendChild(card);
    });
  }

  createPillarKPICard(pillar) {
    const card = document.createElement('div');
    card.className = 'kpi-pillar-card';
    card.dataset.pillar = pillar;
    card.style.borderTop = `3px solid ${pillarConfigManager.getColor(pillar)}`;

    const defs = getKpiDefinitions()[pillar];
    defs.forEach((def) => {
      const item = document.createElement('div');
      item.className = 'kpi-item';
      item.id = `kpi-${def.id}`;

      const value = def.getValue(this.dataManager);
      const formatted = def.format(value);
      const color = def.color(value);

      item.innerHTML = `
        <div class="kpi-item__value" style="color: ${color}">${formatted}</div>
        <div class="kpi-item__label">${def.icon} ${def.label}</div>
      `;

      card.appendChild(item);
    });

    return card;
  }

  // Called by reRenderPillars — nothing extra needed beyond DOM clear
  destroy() {}

  refresh() {
    if (!this.container) return;
    const pillars = pillarConfigManager.getActiveIds();

    pillars.forEach((pillar) => {
      const defs = getKpiDefinitions()[pillar];
      defs.forEach((def) => {
        const el = document.getElementById(`kpi-${def.id}`);
        if (!el) return;

        const value = def.getValue(this.dataManager);
        const formatted = def.format(value);
        const color = def.color(value);

        const valueEl = el.querySelector('.kpi-item__value');
        if (valueEl) {
          valueEl.textContent = formatted;
          valueEl.style.color = color;
        }

        // Update label text (changes on language switch)
        const labelEl = el.querySelector('.kpi-item__label');
        if (labelEl) {
          labelEl.textContent = `${def.icon} ${def.label}`;
        }
      });
    });
  }
}

export { KPICards };
