/* ============================================
   DMS Dashboard - Pillar Config Manager
   ============================================
   Stores pillar display configuration:
   custom name, custom letter, visibility and
   order. Fires 'pillarConfigChange' on update.
   ============================================ */

import { i18n } from './i18n.js';

const PILLAR_CONFIG_KEY = 'dms_pillar_config';

// Base pillar definitions (ids and defaults are immutable)
const BUILTIN = [
  { id: 'safety',   letterDefault: 'S', nameKey: 'pillarSafety',   color: '#27ae60' },
  { id: 'quality',  letterDefault: 'Q', nameKey: 'pillarQuality',  color: '#3498db' },
  { id: 'cost',     letterDefault: 'C', nameKey: 'pillarCost',     color: '#e67e22' },
  { id: 'delivery', letterDefault: 'D', nameKey: 'pillarDelivery', color: '#2471a3' },
  { id: 'people',   letterDefault: 'P', nameKey: 'pillarPeople',   color: '#8e44ad' },
];

// Build default state
function defaultState() {
  return BUILTIN.map((b, i) => ({
    id:           b.id,
    letterDefault: b.letterDefault,
    nameKey:      b.nameKey,
    color:        b.color,
    order:        i,
    visible:      true,
    customName:   null,
    customLetter: null,
  }));
}

class PillarConfigManager {
  constructor() {
    this._pillars = defaultState();
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(PILLAR_CONFIG_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Merge saved state (only user-editable fields)
      saved.forEach((s) => {
        const p = this._pillars.find((x) => x.id === s.id);
        if (!p) return;
        p.order        = s.order        ?? p.order;
        p.visible      = s.visible      ?? p.visible;
        p.customName   = s.customName   ?? null;
        p.customLetter = s.customLetter ?? null;
      });
      this._sort();
    } catch (_) {}
  }

  _save() {
    const payload = this._pillars.map(({ id, order, visible, customName, customLetter }) =>
      ({ id, order, visible, customName, customLetter }),
    );
    localStorage.setItem(PILLAR_CONFIG_KEY, JSON.stringify(payload));
  }

  _sort() {
    this._pillars.sort((a, b) => a.order - b.order);
  }

  _fire() {
    document.dispatchEvent(new CustomEvent('pillarConfigChange'));
  }

  // ── Getters ──

  /** All pillars in current order */
  getAll() { return [...this._pillars]; }

  /** Only visible pillars in current order */
  getActive() { return this._pillars.filter((p) => p.visible); }

  /** Active pillar IDs in order */
  getActiveIds() { return this.getActive().map((p) => p.id); }

  /** Display name for a pillar (custom → i18n default) */
  getName(id) {
    const p = this._pillars.find((x) => x.id === id);
    return p ? (p.customName || i18n.t(p.nameKey)) : id;
  }

  /** Display letter (custom → built-in default) */
  getLetter(id) {
    const p = this._pillars.find((x) => x.id === id);
    return p ? (p.customLetter || p.letterDefault) : '?';
  }

  /** Accent color (fixed per pillar for now) */
  getColor(id) {
    const p = this._pillars.find((x) => x.id === id);
    return p ? p.color : '#9ca3af';
  }

  isVisible(id) {
    const p = this._pillars.find((x) => x.id === id);
    return p ? p.visible : false;
  }

  // ── Mutators ──

  setName(id, name) {
    const p = this._pillars.find((x) => x.id === id);
    if (!p) return;
    p.customName = name.trim() || null;
    this._save();
    this._fire();
  }

  setLetter(id, letter) {
    const p = this._pillars.find((x) => x.id === id);
    if (!p) return;
    p.customLetter = letter.trim().slice(0, 2).toUpperCase() || null;
    this._save();
    this._fire();
  }

  setVisible(id, visible) {
    // Prevent hiding the last visible pillar
    if (!visible && this.getActive().length <= 1) return false;
    const p = this._pillars.find((x) => x.id === id);
    if (!p) return false;
    p.visible = visible;
    this._save();
    this._fire();
    return true;
  }

  moveUp(id) {
    const idx = this._pillars.findIndex((x) => x.id === id);
    if (idx <= 0) return;
    this._pillars[idx].order--;
    this._pillars[idx - 1].order++;
    this._sort();
    this._save();
    this._fire();
  }

  moveDown(id) {
    const idx = this._pillars.findIndex((x) => x.id === id);
    if (idx >= this._pillars.length - 1) return;
    this._pillars[idx].order++;
    this._pillars[idx + 1].order--;
    this._sort();
    this._save();
    this._fire();
  }

  reset() {
    this._pillars = defaultState();
    this._save();
    this._fire();
  }
}

const pillarConfigManager = new PillarConfigManager();
export { pillarConfigManager };
