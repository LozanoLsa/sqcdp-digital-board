import { i18n } from './i18n.js';
import { pillarConfigManager } from './pillarConfigManager.js';

/* ============================================
   DMS Dashboard - Circular Calendar Renderer
   ============================================
   Renders each SQCDP pillar as a donut ring
   of 31 day-segments with the letter centered.
   ============================================ */

const PILLAR_CONFIG = {
  safety:   { letter: 'S', label: 'Safety',   fullLabelKey: 'pillarSafety' },
  quality:  { letter: 'Q', label: 'Quality',  fullLabelKey: 'pillarQuality' },
  cost:     { letter: 'C', label: 'Cost',     fullLabelKey: 'pillarCost' },
  delivery: { letter: 'D', label: 'Delivery', fullLabelKey: 'pillarDelivery' },
  people:   { letter: 'P', label: 'People',   fullLabelKey: 'pillarPeople' },
};

// SVG constants
const SVG_SIZE = 280;
const CENTER = SVG_SIZE / 2;
const OUTER_R = 125;
const INNER_R = 82;
const GAP_DEG = 1.2;         // gap between segments
const TOTAL_SLOTS = 31;
const SLOT_DEG = (360 - TOTAL_SLOTS * GAP_DEG) / TOTAL_SLOTS;
const START_OFFSET = -90;    // start at 12 o'clock

// ── SVG arc path helper ──
function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcSegmentPath(cx, cy, innerR, outerR, startDeg, endDeg) {
  const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;
  const outerStart = polarToXY(cx, cy, outerR, startDeg);
  const outerEnd = polarToXY(cx, cy, outerR, endDeg);
  const innerStart = polarToXY(cx, cy, innerR, endDeg);
  const innerEnd = polarToXY(cx, cy, innerR, startDeg);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

// ── Status color map ──
const STATUS_COLORS = {
  green:  { fill: '#2ecc71', hover: '#27ae60' },
  yellow: { fill: '#f1c40f', hover: '#d4ac0d' },
  red:    { fill: '#e74c3c', hover: '#c0392b' },
  nodata: { fill: 'rgba(255,255,255,0.2)', hover: 'rgba(255,255,255,0.35)' },
  grey:   { fill: 'rgba(255,255,255,0.08)', hover: 'rgba(255,255,255,0.08)' },
};

class LetterCalendar {
  constructor(pillar, dataManager, onCellClick) {
    this.pillar = pillar;
    this.config = PILLAR_CONFIG[pillar];
    this.dataManager = dataManager;
    this.onCellClick = onCellClick;
    this.element = null;
    this.segmentElements = {};
    this.labelElements = {};
  }

  render() {
    const card = document.createElement('div');
    card.className = 'letter-card';
    card.dataset.pillar = this.pillar;
    card.id = `letter-card-${this.pillar}`;

    // Header
    const header = document.createElement('div');
    header.className = 'letter-card__header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'letter-card__title-wrap';

    const title = document.createElement('span');
    title.className = 'letter-card__title';
    title.id = `pillar-title-${this.pillar}`;
    title.textContent = pillarConfigManager.getName(this.pillar);

    const subtitle = document.createElement('span');
    subtitle.className = 'letter-card__subtitle';
    subtitle.id = `month-label-${this.pillar}`;
    subtitle.textContent = this.dataManager.getMonthLabel();

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const score = document.createElement('span');
    score.className = 'letter-card__score';
    score.id = `score-${this.pillar}`;

    header.appendChild(titleWrap);
    header.appendChild(score);
    card.appendChild(header);

    // SVG Ring
    const ring = this.renderRing();
    card.appendChild(ring);

    this.element = card;
    this.updateScore();
    return card;
  }

  renderRing() {
    const wrapper = document.createElement('div');
    wrapper.className = 'ring-wrapper';
    wrapper.id = `letter-grid-${this.pillar}`;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${SVG_SIZE} ${SVG_SIZE}`);
    svg.setAttribute('class', 'ring-svg');

    const daysInMonth = this.dataManager.getDaysInMonth();

    // Draw segments
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const day = i + 1;
      const startAngle = START_OFFSET + i * (SLOT_DEG + GAP_DEG);
      const endAngle = startAngle + SLOT_DEG;

      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'ring-segment');

      // Segment path
      const path = document.createElementNS(ns, 'path');
      const d = arcSegmentPath(CENTER, CENTER, INNER_R, OUTER_R, startAngle, endAngle);
      path.setAttribute('d', d);

      if (day > daysInMonth) {
        path.setAttribute('class', 'ring-segment__path ring-segment__path--grey');
        path.setAttribute('fill', STATUS_COLORS.grey.fill);
      } else {
        const status = this.dataManager.getStatus(day, this.pillar);
        const colors = STATUS_COLORS[status] || STATUS_COLORS.nodata;
        path.setAttribute('class', `ring-segment__path ring-segment__path--${status}`);
        path.setAttribute('fill', colors.fill);
        path.setAttribute('data-day', day);
        path.setAttribute('data-pillar', this.pillar);
        path.style.cursor = 'pointer';

        // Click handler
        path.addEventListener('click', () => this.onCellClick(day, this.pillar));

        // Hover tooltip
        const titleEl = document.createElementNS(ns, 'title');
        titleEl.textContent = `${i18n.t('tooltipDay')} ${day}: ${this.dataManager.getSummary(day, this.pillar)}`;
        path.appendChild(titleEl);

        this.segmentElements[day] = path;
      }

      g.appendChild(path);

      // Day number label
      if (day <= daysInMonth) {
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = (INNER_R + OUTER_R) / 2;
        const labelPos = polarToXY(CENTER, CENTER, labelR, midAngle);

        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', labelPos.x);
        label.setAttribute('y', labelPos.y);
        label.setAttribute('class', 'ring-segment__label');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'central');
        label.textContent = day;
        label.style.pointerEvents = 'none';

        g.appendChild(label);
        this.labelElements[day] = label;
      }

      svg.appendChild(g);
    }

    // Center letter
    const letterText = document.createElementNS(ns, 'text');
    letterText.setAttribute('x', CENTER);
    letterText.setAttribute('y', CENTER);
    letterText.setAttribute('class', 'ring-center-letter');
    letterText.setAttribute('text-anchor', 'middle');
    letterText.setAttribute('dominant-baseline', 'central');
    letterText.textContent = pillarConfigManager.getLetter(this.pillar);
    svg.appendChild(letterText);

    wrapper.appendChild(svg);
    return wrapper;
  }

  updateCell(day) {
    const path = this.segmentElements[day];
    if (!path) return;

    const status = this.dataManager.getStatus(day, this.pillar);
    const colors = STATUS_COLORS[status] || STATUS_COLORS.nodata;
    path.setAttribute('fill', colors.fill);
    path.setAttribute('class', `ring-segment__path ring-segment__path--${status}`);

    // Update tooltip
    const titleEl = path.querySelector('title');
    if (titleEl) {
      titleEl.textContent = `${i18n.t('tooltipDay')} ${day}: ${this.dataManager.getSummary(day, this.pillar)}`;
    }

    // Pulse animation
    path.classList.add('ring-segment--updated');
    setTimeout(() => path.classList.remove('ring-segment--updated'), 600);

    this.updateScore();
  }

  updateScore() {
    const scoreEl = document.getElementById(`score-${this.pillar}`);
    if (!scoreEl) return;

    const stats = this.dataManager.getMonthlyStats(this.pillar);
    const total = stats.green + stats.yellow + stats.red;
    if (total === 0) {
      scoreEl.textContent = '—';
      scoreEl.className = 'letter-card__score';
      return;
    }

    const pct = Math.round((stats.green / total) * 100);
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = 'letter-card__score';
    if (pct >= 80) scoreEl.classList.add('badge--green');
    else if (pct >= 50) scoreEl.classList.add('badge--yellow');
    else scoreEl.classList.add('badge--red');
  }

  refresh() {
    if (!this.element) return;

    const pillarTitle = document.getElementById(`pillar-title-${this.pillar}`);
    if (pillarTitle) pillarTitle.textContent = pillarConfigManager.getName(this.pillar);

    const monthLabel = document.getElementById(`month-label-${this.pillar}`);
    if (monthLabel) monthLabel.textContent = this.dataManager.getMonthLabel();

    const oldWrapper = document.getElementById(`letter-grid-${this.pillar}`);
    if (oldWrapper) {
      this.segmentElements = {};
      this.labelElements = {};
      const newWrapper = this.renderRing();
      oldWrapper.replaceWith(newWrapper);
    }

    this.updateScore();
  }
}

export { LetterCalendar, PILLAR_CONFIG };
