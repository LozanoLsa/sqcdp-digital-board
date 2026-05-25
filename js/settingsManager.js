/* ============================================
   DMS Dashboard - Settings Manager
   ============================================
   Stores configurable KPI thresholds in
   localStorage and fires 'settingschange'
   when any value is updated.
   ============================================ */

const SETTINGS_KEY = 'dms_thresholds';

const DEFAULTS = {
  safety: {
    accFreeGreen:  30,  // DWA streak ≥ this → green KPI card
    accFreeYellow:  7,  // DWA streak ≥ this → yellow KPI card
  },
  quality: {
    scrapGreen:  2,     // scrap% ≤ this → green
    scrapYellow: 5,     // scrap% ≤ this → yellow
  },
  cost: {
    oeeGreen:   85,     // OEE% ≥ this → green
    oeeYellow:  65,     // OEE% ≥ this → yellow
    mttrGreen:  30,     // MTTR min ≤ this → green
    mttrYellow: 60,     // MTTR min ≤ this → yellow
  },
  delivery: {
    green:      95,     // fulfillment% ≥ this → green
    yellow:     85,     // fulfillment% ≥ this → yellow
    backlogMax: 10,     // backlog count ≤ this → acceptable
  },
  people: {
    green:          95, // attendance% ≥ this → green
    yellow:         90, // attendance% ≥ this → yellow
    trainingTarget:  2, // training hrs/day target
  },
};

class SettingsManager {
  constructor() {
    this._s = JSON.parse(JSON.stringify(DEFAULTS));
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.keys(DEFAULTS).forEach((pillar) => {
        if (parsed[pillar]) {
          this._s[pillar] = { ...DEFAULTS[pillar], ...parsed[pillar] };
        }
      });
    } catch (_) {}
  }

  _save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this._s));
  }

  get(pillar, key) {
    return this._s[pillar]?.[key] ?? DEFAULTS[pillar]?.[key];
  }

  set(pillar, key, value) {
    if (!this._s[pillar]) this._s[pillar] = {};
    this._s[pillar][key] = Number(value);
    this._save();
    document.dispatchEvent(new CustomEvent('settingschange', { detail: { pillar, key, value } }));
  }

  reset() {
    this._s = JSON.parse(JSON.stringify(DEFAULTS));
    this._save();
    document.dispatchEvent(new CustomEvent('settingschange', { detail: { reset: true } }));
  }
}

const settingsManager = new SettingsManager();
export { settingsManager, DEFAULTS };
