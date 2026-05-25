/* ============================================
   DMS Dashboard - Data Entry Modal
   ============================================
   Shows a pillar-specific form when a user
   clicks on a day cell. Supports dynamic
   quality categories and new SQCDP fields.
   ============================================ */

import { PILLAR_CONFIG } from './letterCalendar.js';
import { i18n } from './i18n.js';
import { settingsManager } from './settingsManager.js';

// ── Form field definitions per pillar (evaluated at render time for i18n) ──
function getFormFields(pillar) {
  const fields = {
    safety: [
      { key: 'incidents', label: i18n.t('safetyIncidents'), type: 'number', placeholder: i18n.t('safetyIncidentsPlaceholder'), min: 0, step: 1 },
      { key: 'type', label: i18n.t('safetyType'), type: 'select', options: i18n.t('safetyTypeOptions') },
      { key: 'notes', label: i18n.t('safetyNotes'), type: 'textarea', placeholder: i18n.t('safetyNotesPlaceholder') },
    ],
    quality: [
      { key: 'scrapPct', label: i18n.t('qualityScrapPct'), type: 'number', placeholder: '0.0', min: 0, step: 0.1 },
      { key: 'hasAlert', label: i18n.t('qualityHasAlert'), type: 'select', options: i18n.t('qualityHasAlertOptions') },
      { key: 'alertType', label: i18n.t('qualityAlertType'), type: 'radio', options: i18n.t('qualityAlertTypeOptions'), conditional: 'hasAlert:yes' },
      { key: 'alertCount', label: i18n.t('qualityAlertCount'), type: 'number', placeholder: '1', min: 1, step: 1, conditional: 'hasAlert:yes' },
      { key: 'category', label: i18n.t('qualityCategory'), type: 'dynamic-select', conditional: 'hasAlert:yes' },
      { key: 'description', label: i18n.t('qualityDescription'), type: 'textarea', placeholder: i18n.t('qualityDescriptionPlaceholder'), conditional: 'hasAlert:yes' },
    ],
    cost: [
      { key: '_section_oee', label: i18n.t('costSectionOEE'), type: 'section' },
      { key: 'oee', label: i18n.t('costOEE'), type: 'number', placeholder: '85.0', min: 0, max: 100, step: 0.1 },
      { key: '_section_maint', label: i18n.t('costSectionMaint'), type: 'section' },
      { key: 'failures', label: i18n.t('costFailures'), type: 'number', placeholder: '0', min: 0, step: 1 },
      { key: 'repairTime', label: i18n.t('costRepairTime'), type: 'number', placeholder: '0', min: 0, step: 1 },
      { key: 'equipment', label: i18n.t('costEquipment'), type: 'text', placeholder: i18n.t('costEquipmentPlaceholder') },
      { key: 'notes', label: i18n.t('costNotes'), type: 'textarea', placeholder: i18n.t('costNotesPlaceholder') },
    ],
    delivery: [
      { key: 'total', label: i18n.t('deliveryTotal'), type: 'number', placeholder: i18n.t('deliveryTotalPlaceholder'), min: 0, step: 1 },
      { key: 'completed', label: i18n.t('deliveryCompleted'), type: 'number', placeholder: i18n.t('deliveryCompletedPlaceholder'), min: 0, step: 1 },
      { key: 'backlog', label: i18n.t('deliveryBacklog'), type: 'number', placeholder: '0', min: 0, step: 1 },
      { key: 'notes', label: i18n.t('deliveryNotes'), type: 'textarea', placeholder: i18n.t('deliveryNotesPlaceholder') },
    ],
    people: [
      { key: 'present', label: i18n.t('peoplePresent'), type: 'number', placeholder: i18n.t('peoplePresentPlaceholder'), min: 0, step: 1 },
      { key: 'total', label: i18n.t('peopleTotal'), type: 'number', placeholder: i18n.t('peopleTotalPlaceholder'), min: 0, step: 1 },
      { key: 'trainingHrs', label: i18n.t('peopleTraining'), type: 'number', placeholder: '0', min: 0, step: 0.5 },
      { key: 'kaizen', label: i18n.t('peopleKaizen'), type: 'number', placeholder: '0', min: 0, step: 1 },
      { key: 'notes', label: i18n.t('peopleNotes'), type: 'textarea', placeholder: i18n.t('peopleNotesPlaceholder') },
    ],
  };
  return fields[pillar] || [];
}

// ── Pillar accent colors for the modal badge ──
const PILLAR_COLORS = {
  safety: 'var(--pillar-safety)',
  quality: 'var(--pillar-quality)',
  cost: 'var(--pillar-cost)',
  delivery: 'var(--pillar-delivery)',
  people: 'var(--pillar-people)',
};

class Modal {
  constructor(dataManager, onSave) {
    this.dataManager = dataManager;
    this.onSave = onSave;
    this.overlay = null;
    this.modal = null;
    this.currentDay = null;
    this.currentPillar = null;
    this.formInputs = {};
    this.statusPreview = null;
    this.conditionalGroups = [];
    this.createDOM();
  }

  // ── Create the modal DOM structure ──
  createDOM() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.id = 'data-entry-modal';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Modal container
    this.modal = document.createElement('div');
    this.modal.className = 'modal';

    // Header
    this.headerEl = document.createElement('div');
    this.headerEl.className = 'modal__header';
    this.headerEl.innerHTML = `
      <div class="modal__header-left">
        <div class="modal__pillar-badge" id="modal-badge"></div>
        <div>
          <div class="modal__title" id="modal-title"></div>
          <div class="modal__day-label" id="modal-day-label"></div>
        </div>
      </div>
      <button class="modal__close" id="modal-close-btn" title="Close">×</button>
    `;

    // Body
    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'modal__body';
    this.bodyEl.id = 'modal-body';

    // Footer — store button refs for i18n updates
    this.footerEl = document.createElement('div');
    this.footerEl.className = 'modal__footer';

    this.clearBtn = document.createElement('button');
    this.clearBtn.className = 'btn btn--secondary';
    this.clearBtn.id = 'modal-clear-btn';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.className = 'btn btn--secondary';
    this.cancelBtn.id = 'modal-cancel-btn';

    this.saveBtn = document.createElement('button');
    this.saveBtn.className = 'btn btn--success';
    this.saveBtn.id = 'modal-save-btn';

    this.footerEl.appendChild(this.clearBtn);
    this.footerEl.appendChild(this.cancelBtn);
    this.footerEl.appendChild(this.saveBtn);

    this.modal.appendChild(this.headerEl);
    this.modal.appendChild(this.bodyEl);
    this.modal.appendChild(this.footerEl);
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);

    // Event listeners
    document.getElementById('modal-close-btn').addEventListener('click', () => this.close());
    this.cancelBtn.addEventListener('click', () => this.close());
    this.saveBtn.addEventListener('click', () => this.save());
    this.clearBtn.addEventListener('click', () => this.clearData());

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('modal-overlay--active')) {
        this.close();
      }
    });

    this.updateButtonLabels();
  }

  // ── Update button/label text to current language ──
  updateButtonLabels() {
    this.clearBtn.textContent = i18n.t('modalClear');
    this.cancelBtn.textContent = i18n.t('modalCancel');
    this.saveBtn.textContent = i18n.t('modalSave');
  }

  // ── Open modal for a specific day & pillar ──
  open(day, pillar) {
    this.currentDay = day;
    this.currentPillar = pillar;
    this.modal.dataset.pillar = pillar;

    const config = PILLAR_CONFIG[pillar];

    // Update header
    const badge = document.getElementById('modal-badge');
    badge.textContent = config.letter;
    badge.style.background = PILLAR_COLORS[pillar];

    document.getElementById('modal-title').textContent =
      `${config.label} — ${i18n.t(config.fullLabelKey)}`;
    document.getElementById('modal-day-label').textContent =
      `📅 ${i18n.t('modalDayPrefix')} ${day} · ${this.dataManager.getMonthLabel()}`;

    this.updateButtonLabels();

    // Build form
    this.buildForm(pillar, day);

    // Show
    this.overlay.classList.add('modal-overlay--active');

    // Focus first input
    setTimeout(() => {
      const firstInput = this.bodyEl.querySelector('input, select');
      if (firstInput) firstInput.focus();
    }, 300);
  }

  // ── Build form fields ──
  buildForm(pillar, day) {
    const body = this.bodyEl;
    body.innerHTML = '';
    this.formInputs = {};
    this.conditionalGroups = [];

    // Status preview
    this.statusPreview = document.createElement('div');
    this.statusPreview.className = 'form-status-preview';
    this.statusPreview.innerHTML = `
      <div class="form-status-preview__dot" id="status-dot"></div>
      <div class="form-status-preview__text" id="status-text">${i18n.t('modalStatusPlaceholder')}</div>
    `;
    body.appendChild(this.statusPreview);

    // Existing data
    const existingData = this.dataManager.getDayData(day, pillar) || {};

    // Form fields — evaluated now so labels pick up current language
    const fields = getFormFields(pillar);
    fields.forEach((field) => {
      // Section headers
      if (field.type === 'section') {
        const section = document.createElement('div');
        section.className = 'form-section-header';
        section.textContent = field.label;
        body.appendChild(section);
        return;
      }

      const group = document.createElement('div');
      group.className = 'form-group';
      group.dataset.fieldKey = field.key;

      // Handle conditional visibility
      if (field.conditional) {
        group.classList.add('form-group--conditional');
        group.style.display = 'none';
        this.conditionalGroups.push({ group, condition: field.conditional });
      }

      const label = document.createElement('label');
      label.className = 'form-group__label';
      label.textContent = field.label;
      label.setAttribute('for', `field-${field.key}`);
      group.appendChild(label);

      let input;

      if (field.type === 'select') {
        input = this.createSelect(field, existingData);
      } else if (field.type === 'radio') {
        input = this.createRadioGroup(field, existingData);
      } else if (field.type === 'dynamic-select') {
        input = this.createDynamicSelect(field, existingData);
      } else if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'form-group__textarea';
        input.placeholder = field.placeholder || '';
      } else {
        input = document.createElement('input');
        input.className = 'form-group__input';
        input.type = field.type;
        input.placeholder = field.placeholder || '';
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
      }

      if (input.tagName) {
        input.id = `field-${field.key}`;
        input.name = field.key;
      }

      // Pre-fill with existing data
      if (existingData[field.key] !== undefined && existingData[field.key] !== null && field.type !== 'radio' && field.type !== 'dynamic-select') {
        input.value = existingData[field.key];
      }

      // Live preview on change
      if (input.tagName) {
        input.addEventListener('input', () => {
          this.updateStatusPreview();
          this.updateConditionals();
        });
        input.addEventListener('change', () => {
          this.updateStatusPreview();
          this.updateConditionals();
        });
      }

      group.appendChild(input);

      // Add hint for thresholds
      const hint = this.getHint(pillar, field.key);
      if (hint) {
        const hintEl = document.createElement('div');
        hintEl.className = 'form-group__hint';
        hintEl.textContent = hint;
        group.appendChild(hintEl);
      }

      body.appendChild(group);
      this.formInputs[field.key] = input;
    });

    // Initial state
    this.updateConditionals();
    this.updateStatusPreview();
  }

  // ── Create a standard select dropdown ──
  createSelect(field, existingData) {
    const select = document.createElement('select');
    select.className = 'form-group__select';
    field.options.forEach((opt) => {
      const option = document.createElement('option');
      if (typeof opt === 'object') {
        option.value = opt.value;
        option.textContent = opt.text;
      } else {
        option.value = opt;
        option.textContent = opt || '—';
      }
      select.appendChild(option);
    });
    if (existingData[field.key] !== undefined) {
      select.value = existingData[field.key];
    }
    return select;
  }

  // ── Create radio button group ──
  createRadioGroup(field, existingData) {
    const container = document.createElement('div');
    container.className = 'form-radio-group';
    container.id = `field-${field.key}`;

    field.options.forEach((opt) => {
      const radioLabel = document.createElement('label');
      radioLabel.className = 'form-radio-option';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = field.key;
      radio.value = opt.value;
      radio.className = 'form-radio-option__input';

      if (existingData[field.key] === opt.value) {
        radio.checked = true;
      }

      radio.addEventListener('change', () => {
        this.updateStatusPreview();
        this.updateConditionals();
      });

      const text = document.createElement('span');
      text.className = 'form-radio-option__text';
      text.textContent = opt.text;

      radioLabel.appendChild(radio);
      radioLabel.appendChild(text);
      container.appendChild(radioLabel);
    });

    return container;
  }

  // ── Create dynamic select with add/remove ──
  createDynamicSelect(field, existingData) {
    const container = document.createElement('div');
    container.className = 'form-dynamic-select';
    container.id = `field-${field.key}`;

    // Select dropdown
    const select = document.createElement('select');
    select.className = 'form-group__select';
    select.name = field.key;
    select.id = `field-${field.key}-select`;

    this.populateCategorySelect(select);

    if (existingData[field.key]) {
      select.value = existingData[field.key];
    }

    select.addEventListener('change', () => {
      this.updateStatusPreview();
    });

    container.appendChild(select);

    // Add/remove buttons row
    const actions = document.createElement('div');
    actions.className = 'form-dynamic-select__actions';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--xs btn--secondary';
    addBtn.textContent = i18n.t('modalAddCategory');
    addBtn.addEventListener('click', () => this.promptAddCategory(select));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn--xs btn--danger-outline';
    removeBtn.textContent = i18n.t('modalRemoveCategory');
    removeBtn.addEventListener('click', () => this.removeSelectedCategory(select));

    actions.appendChild(addBtn);
    actions.appendChild(removeBtn);
    container.appendChild(actions);

    return container;
  }

  // ── Populate category dropdown ──
  populateCategorySelect(select) {
    select.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = i18n.t('modalSelectCategory');
    select.appendChild(defaultOpt);

    this.dataManager.getCategories().forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  }

  // ── Prompt to add a new category ──
  promptAddCategory(select) {
    const name = prompt(i18n.t('modalCategoryPrompt'));
    if (name && name.trim()) {
      const added = this.dataManager.addCategory(name.trim());
      if (added) {
        this.populateCategorySelect(select);
        select.value = name.trim();
      } else {
        alert(i18n.t('modalCategoryExists'));
      }
    }
  }

  // ── Remove the currently selected category ──
  removeSelectedCategory(select) {
    const value = select.value;
    if (!value) return;
    const msg = i18n.t('modalCategoryConfirm').replace('{name}', value);
    if (confirm(msg)) {
      this.dataManager.removeCategory(value);
      this.populateCategorySelect(select);
    }
  }

  // ── Update conditional field visibility ──
  updateConditionals() {
    this.conditionalGroups.forEach(({ group, condition }) => {
      const [fieldKey, expectedValue] = condition.split(':');
      const input = this.formInputs[fieldKey];
      let currentValue = '';

      if (input && input.tagName === 'SELECT') {
        currentValue = input.value;
      } else if (input && input.tagName === 'DIV') {
        // Radio group
        const checked = input.querySelector('input[type="radio"]:checked');
        currentValue = checked ? checked.value : '';
      }

      const show = currentValue === expectedValue;
      group.style.display = show ? '' : 'none';
    });
  }

  // ── Get threshold hint text (reflects current settings) ──
  getHint(pillar, fieldKey) {
    const g = (p, k) => settingsManager.get(p, k);
    const hints = {
      safety:   { incidents: i18n.t('safetyIncidentsHint') },
      quality:  { hasAlert:  i18n.t('qualityHasAlertHint') },
      cost: {
        oee: `🟩 ≥${g('cost','oeeGreen')}% | 🟨 ${g('cost','oeeYellow')}–${g('cost','oeeGreen')}% | 🟥 <${g('cost','oeeYellow')}%`,
      },
      delivery: {
        completed: `🟩 ≥${g('delivery','green')}% | 🟨 ${g('delivery','yellow')}–${g('delivery','green')}% | 🟥 <${g('delivery','yellow')}%`,
      },
      people: {
        present: `🟩 ≥${g('people','green')}% | 🟨 ${g('people','yellow')}–${g('people','green')}% | 🟥 <${g('people','yellow')}%`,
      },
    };
    return hints[pillar]?.[fieldKey] || null;
  }

  // ── Update the status preview indicator ──
  updateStatusPreview() {
    const values = this.getFormValues();
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    if (!dot || !text) return;

    const status = this.evaluatePreview(this.currentPillar, values);

    dot.className = 'form-status-preview__dot';
    dot.classList.add(`form-status-preview__dot--${status}`);

    const statusLabels = {
      green:  i18n.t('statusGreen'),
      yellow: i18n.t('statusYellow'),
      red:    i18n.t('statusRed'),
      nodata: i18n.t('statusNodata'),
      grey:   i18n.t('statusGrey'),
    };
    text.innerHTML = `${i18n.t('modalStatusPrefix')} <strong>${statusLabels[status] || i18n.t('statusNodata')}</strong>`;
  }

  // ── Evaluate status preview without saving ──
  evaluatePreview(pillar, values) {
    switch (pillar) {
      case 'safety':
        if (values.incidents === undefined || values.incidents === '') return 'nodata';
        return Number(values.incidents) === 0 ? 'green' : 'red';
      case 'quality':
        if (!values.hasAlert || values.hasAlert === '') return 'nodata';
        if (values.hasAlert === 'no') return 'green';
        if (values.alertType === 'external') return 'red';
        return 'yellow';
      case 'cost': {
        if (!values.oee || values.oee === '') return 'nodata';
        const oee = Number(values.oee);
        if (oee >= settingsManager.get('cost', 'oeeGreen'))  return 'green';
        if (oee >= settingsManager.get('cost', 'oeeYellow')) return 'yellow';
        return 'red';
      }
      case 'delivery': {
        if (!values.completed || !values.total) return 'nodata';
        const dpct = (Number(values.completed) / Number(values.total)) * 100;
        if (dpct >= settingsManager.get('delivery', 'green'))  return 'green';
        if (dpct >= settingsManager.get('delivery', 'yellow')) return 'yellow';
        return 'red';
      }
      case 'people': {
        if (!values.present || !values.total) return 'nodata';
        const ppct = (Number(values.present) / Number(values.total)) * 100;
        if (ppct >= settingsManager.get('people', 'green'))  return 'green';
        if (ppct >= settingsManager.get('people', 'yellow')) return 'yellow';
        return 'red';
      }
      default:
        return 'nodata';
    }
  }

  // ── Get all form values ──
  getFormValues() {
    const values = {};
    Object.entries(this.formInputs).forEach(([key, input]) => {
      if (key.startsWith('_section')) return;

      if (input.tagName === 'SELECT') {
        values[key] = input.value;
      } else if (input.tagName === 'DIV') {
        if (input.classList.contains('form-radio-group')) {
          const checked = input.querySelector('input[type="radio"]:checked');
          values[key] = checked ? checked.value : '';
        } else if (input.classList.contains('form-dynamic-select')) {
          const select = input.querySelector('select');
          values[key] = select ? select.value : '';
        }
      } else {
        values[key] = input.value;
      }
    });
    return values;
  }

  // ── Save form data ──
  save() {
    const values = this.getFormValues();

    // Convert numeric fields
    const fields = getFormFields(this.currentPillar);
    fields.forEach((field) => {
      if (field.type === 'number' && values[field.key] !== undefined && values[field.key] !== '') {
        values[field.key] = Number(values[field.key]);
      }
    });

    this.dataManager.setDayData(this.currentDay, this.currentPillar, values);

    if (this.onSave) {
      this.onSave(this.currentDay, this.currentPillar);
    }

    this.close();
  }

  // ── Clear data for this day/pillar ──
  clearData() {
    Object.entries(this.formInputs).forEach(([key, input]) => {
      if (input.tagName === 'SELECT' || input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        input.value = '';
      } else if (input.tagName === 'DIV') {
        if (input.classList.contains('form-radio-group')) {
          input.querySelectorAll('input').forEach((r) => (r.checked = false));
        } else if (input.classList.contains('form-dynamic-select')) {
          const select = input.querySelector('select');
          if (select) select.value = '';
        }
      }
    });
    this.updateConditionals();
    this.updateStatusPreview();
  }

  // ── Close modal ──
  close() {
    this.overlay.classList.remove('modal-overlay--active');
    this.currentDay = null;
    this.currentPillar = null;
  }
}

export { Modal };
