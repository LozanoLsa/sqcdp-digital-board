/* ============================================
   DMS Dashboard - Settings Sidebar
   ============================================
   Collapsible right panel for editing KPI
   thresholds per pillar. Changes are applied
   immediately and persisted in localStorage.
   ============================================ */

import { i18n } from './i18n.js';
import { settingsManager, DEFAULTS } from './settingsManager.js';
import { pillarConfigManager } from './pillarConfigManager.js';

const PILLAR_KEYS = {
  safety:   'pillarSafety',
  quality:  'pillarQuality',
  cost:     'pillarCost',
  delivery: 'pillarDelivery',
  people:   'pillarPeople',
};

const PILLAR_ICONS = {
  safety:   '🛡️',
  quality:  '🔵',
  cost:     '⚙️',
  delivery: '🚚',
  people:   '👥',
};

const SECTION_FIELDS = {
  // ── Safety ──
  safety: [
    { key: 'accFreeGreen',  labelKey: 'sidebarSafetyAccFreeGreen',  dot: 'green',  min: 1, step: 1 },
    { key: 'accFreeYellow', labelKey: 'sidebarSafetyAccFreeYellow', dot: 'yellow', min: 1, step: 1 },
  ],
  // ── Quality ──
  quality: [
    { key: 'scrapGreen',  labelKey: 'sidebarQualityScrapGreen',  dot: 'green',  min: 0, max: 100, step: 0.5 },
    { key: 'scrapYellow', labelKey: 'sidebarQualityScrapYellow', dot: 'yellow', min: 0, max: 100, step: 0.5 },
  ],
  // ── Cost ──
  cost: [
    { key: 'oeeGreen',    labelKey: 'sidebarCostOEEGreen',    dot: 'green',  min: 1, max: 100, step: 1 },
    { key: 'oeeYellow',   labelKey: 'sidebarCostOEEYellow',   dot: 'yellow', min: 1, max: 100, step: 1 },
    { key: 'mttrGreen',   labelKey: 'sidebarCostMTTRGreen',   dot: 'green',  min: 1, step: 1 },
    { key: 'mttrYellow',  labelKey: 'sidebarCostMTTRYellow',  dot: 'yellow', min: 1, step: 1 },
  ],
  // ── Delivery ──
  delivery: [
    { key: 'green',      labelKey: 'sidebarDeliveryGreen',      dot: 'green',  min: 1, max: 100, step: 1 },
    { key: 'yellow',     labelKey: 'sidebarDeliveryYellow',     dot: 'yellow', min: 1, max: 100, step: 1 },
    { key: 'backlogMax', labelKey: 'sidebarDeliveryBacklogMax', dot: 'yellow', min: 0, step: 1 },
  ],
  // ── People ──
  people: [
    { key: 'green',          labelKey: 'sidebarPeopleGreen',          dot: 'green',  min: 1, max: 100, step: 1 },
    { key: 'yellow',         labelKey: 'sidebarPeopleYellow',         dot: 'yellow', min: 1, max: 100, step: 1 },
    { key: 'trainingTarget', labelKey: 'sidebarPeopleTrainingTarget', dot: 'green',  min: 0, step: 0.5 },
  ],
};

class SettingsSidebar {
  constructor() {
    this.panel   = null;
    this.overlay = null;
    this.isOpen  = false;
    this._create();
  }

  // ── Build DOM ──
  _create() {
    // Dim overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'settings-overlay';
    this.overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this.overlay);

    // Panel
    this.panel = document.createElement('div');
    this.panel.className = 'settings-sidebar';
    document.body.appendChild(this.panel);

    this._buildContent();
  }

  // ── Render / re-render panel content ──
  _buildContent() {
    this.panel.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'settings-sidebar__header';
    const titleEl = document.createElement('span');
    titleEl.className = 'settings-sidebar__title';
    titleEl.textContent = `⚙️ ${i18n.t('sidebarTitle')}`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'settings-sidebar__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    this.panel.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'settings-sidebar__body';

    // ── Pillars section (first) ──
    body.appendChild(this._buildPillarsSection());

    // ── KPI Threshold sections ──
    Object.keys(SECTION_FIELDS).forEach((pillar) =>
      body.appendChild(this._buildSection(pillar)),
    );
    this.panel.appendChild(body);

    // Footer — reset button
    const footer = document.createElement('div');
    footer.className = 'settings-sidebar__footer';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn--secondary btn--full';
    resetBtn.textContent = i18n.t('sidebarReset');
    resetBtn.addEventListener('click', () => {
      settingsManager.reset();
      this._buildContent(); // refresh inputs to defaults
    });
    footer.appendChild(resetBtn);
    this.panel.appendChild(footer);
  }

  // ── Build Pillars config section ──
  _buildPillarsSection() {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const title = document.createElement('div');
    title.className = 'settings-section__title';
    title.textContent = `🔷 ${i18n.t('sidebarPillarsTitle')}`;
    section.appendChild(title);

    const allPillars = pillarConfigManager.getAll();

    allPillars.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = `pillar-row${!p.visible ? ' pillar-row--hidden' : ''}`;

      // ── Visibility checkbox ──
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'pillar-row__check';
      check.checked = p.visible;
      check.title = p.visible ? 'Hide pillar' : 'Show pillar';
      check.addEventListener('change', () => {
        const ok = pillarConfigManager.setVisible(p.id, check.checked);
        if (!ok) {
          // Prevent unchecking the last pillar
          check.checked = true;
          const warn = document.createElement('div');
          warn.className = 'pillar-row__warn';
          warn.textContent = i18n.t('sidebarAtLeastOne');
          row.appendChild(warn);
          setTimeout(() => warn.remove(), 2500);
        }
      });

      // ── Letter input ──
      const letter = document.createElement('input');
      letter.type = 'text';
      letter.className = 'pillar-row__letter';
      letter.maxLength = 2;
      letter.value = pillarConfigManager.getLetter(p.id);
      letter.title = i18n.t('sidebarPillarLetter');
      letter.addEventListener('blur', () => {
        pillarConfigManager.setLetter(p.id, letter.value);
        // refresh displayed value (may have been trimmed/uppercased)
        letter.value = pillarConfigManager.getLetter(p.id);
      });

      // ── Name input ──
      const name = document.createElement('input');
      name.type = 'text';
      name.className = 'pillar-row__name';
      name.placeholder = i18n.t(p.nameKey);
      name.value = p.customName || '';
      name.title = i18n.t('sidebarPillarName');
      name.addEventListener('blur', () => {
        pillarConfigManager.setName(p.id, name.value);
      });

      // ── Move up button ──
      const upBtn = document.createElement('button');
      upBtn.className = 'pillar-row__btn';
      upBtn.textContent = '▲';
      upBtn.title = 'Move up';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => {
        pillarConfigManager.moveUp(p.id);
        this._buildContent(); // rebuild with new order
      });

      // ── Move down button ──
      const downBtn = document.createElement('button');
      downBtn.className = 'pillar-row__btn';
      downBtn.textContent = '▼';
      downBtn.title = 'Move down';
      downBtn.disabled = idx === allPillars.length - 1;
      downBtn.addEventListener('click', () => {
        pillarConfigManager.moveDown(p.id);
        this._buildContent();
      });

      row.appendChild(check);
      row.appendChild(letter);
      row.appendChild(name);
      row.appendChild(upBtn);
      row.appendChild(downBtn);
      section.appendChild(row);
    });

    // ── Reset pillars button ──
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn--secondary btn--full';
    resetBtn.style.marginTop = 'var(--space-3)';
    resetBtn.textContent = i18n.t('sidebarResetPillars');
    resetBtn.addEventListener('click', () => {
      pillarConfigManager.reset();
      this._buildContent();
    });
    section.appendChild(resetBtn);

    return section;
  }

  // ── Build one KPI threshold section ──
  _buildSection(pillar) {
    const section = document.createElement('div');
    section.className = 'settings-section';

    const title = document.createElement('div');
    title.className = 'settings-section__title';
    title.textContent = i18n.t(PILLAR_KEYS[pillar]);
    section.appendChild(title);

    SECTION_FIELDS[pillar].forEach(({ key, labelKey, dot, min, max, step }) => {
      const row = document.createElement('div');
      row.className = `settings-field settings-field--${dot}`;

      const label = document.createElement('label');
      label.className = 'settings-field__label';
      label.textContent = i18n.t(labelKey);
      const inputId = `thr-${pillar}-${key}`;
      label.setAttribute('for', inputId);

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'settings-field__input';
      input.id = inputId;
      input.value = settingsManager.get(pillar, key);
      if (min !== undefined) input.min = min;
      if (max !== undefined) input.max = max;
      if (step !== undefined) input.step = step;

      input.addEventListener('change', () => {
        const val = Number(input.value);
        if (!isNaN(val) && val > 0) {
          settingsManager.set(pillar, key, val);
        } else {
          // Restore last valid value on bad input
          input.value = settingsManager.get(pillar, key);
        }
      });

      row.appendChild(label);
      row.appendChild(input);
      section.appendChild(row);
    });

    return section;
  }

  // ── Re-render labels when language changes ──
  refresh() {
    this._buildContent();
  }

  // ── Open / close / toggle ──
  open() {
    this.isOpen = true;
    this.panel.classList.add('settings-sidebar--open');
    this.overlay.classList.add('settings-overlay--active');
    document.getElementById('btn-settings')?.classList.add('active');
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('settings-sidebar--open');
    this.overlay.classList.remove('settings-overlay--active');
    document.getElementById('btn-settings')?.classList.remove('active');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

export { SettingsSidebar };
