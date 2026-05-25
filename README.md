# 📊 DMS SQCDP Dashboard

> **A fully digital Daily Management System board — no server, no database, no IT dependency to get started.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Language: EN/ES](https://img.shields.io/badge/Language-EN%20%7C%20ES-blue.svg)]()
[![No dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)]()
[![Works offline](https://img.shields.io/badge/Works-Offline-orange.svg)]()

---

## 🤔 Why does this exist?

If you run a Daily Management System (DMS) in your plant today, you probably have one of these:

- A **whiteboard** with magnets that get lost
- A **printed sheet** that fades, gets crumpled, or disappears on Fridays
- An **Excel file** nobody updates consistently
- A **PowerPoint** that takes 20 minutes to fill before every meeting

This dashboard was built to solve exactly that. It lives in a **browser**, works **offline**, stores everything **locally on the machine**, and can be displayed on any **TV or monitor** in your production area. Your team fills it out in seconds, the trends appear automatically, and you export everything to Excel with one click.

**No cloud. No subscription. No vendor lock-in. No IT project.**

---

## 🏭 What is SQCDP?

SQCDP is the backbone of most world-class DMS systems. Each letter represents a dimension your team reviews every day:

| Letter | Pillar | What you track |
|--------|--------|----------------|
| **S** | Safety | Incidents, near-misses, accident-free day streak |
| **Q** | Quality | Alerts (internal/external), scrap rate |
| **C** | Cost | OEE %, equipment failures, MTTR |
| **D** | Delivery | Schedule adherence, order fulfillment, backlog |
| **P** | People | Attendance, training hours, Kaizen suggestions |

Each pillar gets a **green / yellow / red** status every day. The pattern of colors over a month tells you — at a glance — where your operation is healthy and where it needs attention. This is what Lean practitioners call *visual management*.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📅 **Ring Calendar** | 5 donut rings, one per pillar, 31 day-segments each colored green/yellow/red |
| 📊 **10 Charts** | Row 1: primary KPIs. Row 2: secondary world-standard KPIs (DWA, % Scrap, MTTR, Backlog, Training hrs) |
| 🃏 **KPI Cards** | Live aggregate metrics between the chart rows |
| ⚙️ **Configurable Thresholds** | Every green/yellow boundary is adjustable from the sidebar — no code needed |
| 🔷 **Configurable Pillars** | Rename, reorder, hide pillars to match your plant's DMS language |
| 🌐 **EN / ES toggle** | Full bilingual support, switches instantly |
| 📤 **Excel Export** | One click → .xlsx with monthly summary + one tab per pillar |
| 🎲 **Demo Data** | Load a full month of sample data to explore the dashboard before going live |
| 💾 **Auto-save** | All data persists in the browser's local storage — no manual save |
| 📺 **TV-ready** | Responsive layout designed for 1920×1080 and 2560×1440 displays |

---

## 🖥️ Screenshots

> *(Add your own screenshot here after deploying — run the dashboard, press F12 → right-click the page → Save as image, or use Lightshot / Snipping Tool)*

```
[ Screenshot: Ring calendars showing 5 pillars with green/yellow/red day segments ]
[ Screenshot: Chart rows 1 and 2 with KPI cards in between                       ]
```

---

## 📁 What each file does

> **You don't need to touch any of these files to use the dashboard.**
> This section is for curious minds and for IT when they set it up.

```
Daily Management Meeting/
│
├── index.html              ← The page itself. Open this in a browser to launch the app.
├── START-DASHBOARD.bat     ← Double-click launcher for plant PCs (Windows). Starts the server automatically.
│
├── css/
│   ├── variables.css       ← All colors, fonts, spacing — your design tokens
│   ├── layout.css          ← Overall page structure and KPI card styles
│   ├── letters.css         ← The SQCDP donut ring calendars
│   ├── charts.css          ← Chart card styles (rows 1 and 2)
│   ├── modal.css           ← The data-entry popup window
│   ├── components.css      ← Shared UI components (buttons, inputs, badges)
│   └── sidebar.css         ← The KPI Targets settings panel
│
├── js/
│   ├── app.js              ← The conductor — starts everything and connects the pieces
│   ├── dataManager.js      ← Reads and writes all your daily data (safety, quality, etc.)
│   ├── letterCalendar.js   ← Draws the 5 ring calendars (the SQCDP donut circles)
│   ├── charts.js           ← Draws all 10 trend charts using Chart.js
│   ├── kpiCards.js         ← Computes and displays the KPI summary cards
│   ├── modal.js            ← The data-entry form that opens when you click a day
│   ├── sidebar.js          ← The settings panel (thresholds + pillar config)
│   ├── excelExport.js      ← Builds and downloads the .xlsx report
│   ├── settingsManager.js  ← Saves your KPI threshold settings to the browser
│   ├── pillarConfigManager.js ← Saves your pillar names, letters, order, visibility
│   ├── i18n.js             ← All text in English and Spanish
│   └── mockData.js         ← The demo data (April 2026 sample month)
│
├── LICENSE                 ← MIT open-source license
└── README.md               ← This file
```

### How the pieces connect — in plain language

Think of it like a production line:

```
You click a day on the ring  →  modal.js opens the form
You fill in the data         →  dataManager.js saves it to the browser
The ring color updates       →  letterCalendar.js redraws that segment
The charts refresh           →  charts.js re-renders both rows
The KPI cards update         →  kpiCards.js recalculates totals
You click Export             →  excelExport.js builds the .xlsx file
```

Nothing goes to the internet. Everything stays on the local machine.

---

## 🚀 Quick Start — Running it on your own computer

### What you need

- A modern web browser: **Google Chrome** (recommended), Edge, Firefox, or Safari
- A web server — pick the option that fits your situation below

---

### ⚡ Option 0 — START-DASHBOARD.bat (easiest — for plant PCs on Windows)

This is the file you hand to your IT team. No commands. No configuration. Just:

1. Copy the project folder to the plant PC
2. Make sure **Python** or **Node.js** is installed (Python is free from [python.org](https://www.python.org/downloads/))
3. **Double-click `START-DASHBOARD.bat`**
4. The dashboard opens in the browser automatically at `http://localhost:3000`

The script auto-detects which runtime is available. If neither is found, it shows a clear message with download links.

> 🖥️ **For TV / monitor display:** connect the PC to the screen via HDMI, open Chrome in fullscreen (F11), navigate to `http://localhost:3000`. Done.

---

**Option A — VS Code (recommended for OpEx practitioners working from their laptop)**

1. Install [Visual Studio Code](https://code.visualstudio.com/) — free
2. Install the **Live Server** extension (search "Live Server" by Ritwick Dey inside VS Code)
3. Open the `Daily Management Meeting` folder in VS Code
4. Right-click `index.html` → **"Open with Live Server"**
5. The dashboard opens in your browser at `http://127.0.0.1:5500`

**Option B — Node.js (for IT teams)**

```bash
# Install once
npm install -g serve

# Run from the project folder
cd "Daily Management Meeting"
serve . -p 3000
```

Open `http://localhost:3000` in your browser.

**Option C — Python (if already installed)**

```bash
# Python 3
cd "Daily Management Meeting"
python -m http.server 3000
```

Open `http://localhost:3000`.

> ⚠️ **Why can't I just double-click `index.html`?**
> Modern browsers block local ES Modules (JavaScript files that import each other) when opened directly from the file system for security reasons. You need a local web server — any of the options above work fine and take under 5 minutes to set up.

---

## 🏭 Deploying in a Plant Environment — Guide for IT

> This section is for your IT team. Share it with them directly.

### Architecture overview

This is a **100% static web application**:
- No backend server required
- No database
- No user authentication
- No network calls (except loading Chart.js and SheetJS from CDN on first load)
- All data lives in the browser's `localStorage` on the local machine

### Option 1 — Serve from a local machine (simplest)

Best for: a dedicated PC or industrial panel PC connected to a plant TV.

```
[Plant PC] → runs a local web server → [Browser in kiosk mode] → [TV/Monitor]
```

**Steps:**
1. Copy the project folder to the plant PC (USB, network share, or Git clone)
2. Install **Python** (free, [python.org](https://www.python.org/downloads/)) or Node.js (LTS, [nodejs.org](https://nodejs.org/))
3. **Double-click `START-DASHBOARD.bat`** — it starts the server and opens the browser automatically
4. *(Optional)* Add `START-DASHBOARD.bat` to Windows Task Scheduler to launch at startup

**For kiosk / TV mode (always-on display):**
```bat
@echo off
cd "C:\DMS\Daily Management Meeting"
start python -m http.server 3000
timeout /t 3 /nobreak >nul
start chrome --kiosk http://localhost:3000
```
Save as `start-kiosk.bat` and add to Task Scheduler → "Run at logon".

**To display on a TV:** connect the PC to the TV via HDMI. Set Chrome to open on the TV display.

### Option 2 — Serve from an internal web server (recommended for multiple areas)

Best for: multiple production areas sharing the same dashboard from a central server.

```
[Internal Web Server] → serves static files → [Browser on any plant PC/tablet]
```

Since the app is purely static HTML/CSS/JS, it can be served by **any web server**:

| Server | Configuration |
|--------|---------------|
| **Nginx** | Point `root` to the project folder, serve `index.html` |
| **Apache** | Drop the folder in `htdocs/`, no config needed |
| **IIS** | Add as a website, set `index.html` as default document |
| **SharePoint** | Upload files to a document library (limited — CDN must be accessible) |

Example Nginx config:
```nginx
server {
    listen 80;
    server_name dms.yourplant.local;
    root /var/www/dms;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Option 3 — GitHub Pages (free, zero infrastructure)

If your plant has internet access on the display PC:

1. Fork this repository on GitHub
2. Go to **Settings → Pages → Source: Deploy from a branch → main → / (root)**
3. Your dashboard is live at `https://yourusername.github.io/dms-sqcdp-dashboard/`
4. Access from any browser, anywhere

### Firewall / CDN considerations

The dashboard loads two libraries from CDN on first page load:

| Library | URL | Purpose |
|---------|-----|---------|
| Chart.js | `https://cdn.jsdelivr.net/npm/chart.js` | Renders all 10 charts |
| SheetJS | `https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js` | Excel export |

**If your plant network blocks external CDNs:**
1. Download both files manually (links above)
2. Place them in a `/lib/` folder in the project
3. Update the `<script>` tags in `index.html` to point to the local files:
   ```html
   <script src="lib/chart.min.js"></script>
   <script src="lib/xlsx.full.min.js"></script>
   ```

### Data persistence across sessions

All data is stored in the browser's `localStorage` (the same machine, same browser). This means:
- ✅ Data survives browser restarts and PC reboots
- ✅ No network needed after first load
- ❌ Data does NOT sync between different PCs automatically
- ❌ Clearing browser data / "Reset browser settings" will erase data

**For multi-user or multi-PC setups:** use the Excel export at the end of each month as your backup and handoff mechanism.

---

## 🔧 Customizing for Your Plant — No Code Required

Everything configurable is in the **⚙️ KPI Targets sidebar** (top-right button):

### 1. Rename pillars to match your DMS language

Every plant calls things differently. Maybe you call "Cost" → "Productivity" or "People" → "Talent". Click ⚙️ → **Pillars section**:
- Change the **letter** (S, Q, C, D, P) to whatever your board uses
- Change the **name** to your plant's terminology
- **Hide** pillars you don't track
- **Reorder** them to match your physical board

### 2. Set your KPI thresholds

The green/yellow/red boundaries are preset to world-class benchmarks but your operation may differ. In the ⚙️ sidebar → **KPI Targets**:

| Pillar | What to configure |
|--------|-------------------|
| Safety | Minimum accident-free day streak for green/yellow |
| Quality | Maximum acceptable scrap % |
| Cost | OEE% targets + MTTR targets (minutes) |
| Delivery | Fulfillment % targets + max acceptable backlog |
| People | Attendance % targets + daily training hours target |

### 3. Language

Click the **EN / ES** button in the header to toggle between English and Spanish instantly. All labels, forms, chart titles, and Excel exports switch language.

---

## 📋 Daily Operation Guide — For the Team on the Floor

> Print this section and stick it next to the plant PC.

### Morning routine (5 minutes before or during the DMS meeting)

1. Open the browser → navigate to the dashboard URL
2. Click the **day number** on the ring that matches today's date
3. A form opens — fill in the data for each pillar:
   - **Safety:** incidents today? (0 = green day)
   - **Quality:** any alerts? scrap rate?
   - **Cost:** OEE reading from your equipment? any breakdowns?
   - **Delivery:** orders completed vs. planned? any backlog?
   - **People:** headcount present vs. scheduled? training hours?
4. Click **Save** — the ring segment colors instantly and charts update
5. Discuss the trends in the meeting (the last 30 days are visible at a glance)

### End of month

1. Click **📤 Export** in the header
2. An Excel file downloads automatically with:
   - Sheet 1: Monthly KPI summary
   - Sheets 2–6: Daily detail for each pillar
3. Archive the file, share with your manager, or attach it to your monthly review

### Loading demo data

New to the dashboard? Click **🎲 Load Demo** to fill the current month with sample data and see how everything looks before going live.

---

## 🛠️ For Developers

### Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| UI | Vanilla HTML5 + CSS3 | Zero framework overhead, works anywhere |
| Logic | Vanilla ES Modules (JavaScript) | No build step, no bundler, no node_modules |
| Charts | Chart.js v4 (CDN) | Industry-standard, MIT license |
| Export | SheetJS/xlsx (CDN) | Best-in-class Excel generation |
| Storage | Browser localStorage | No backend, works offline |
| Fonts | Inter (Google Fonts) | Designed for data-dense UIs |

### Design principles

- **No build step** — edit a file, refresh the browser, done
- **No framework** — no React, Vue, Angular. Pure DOM manipulation for maximum longevity
- **Event-driven** — components communicate via `CustomEvent` (`langchange`, `settingschange`, `pillarConfigChange`) keeping them decoupled
- **Dynamic i18n** — all labels are evaluated at render time, never at module load
- **Singleton managers** — `dataManager`, `settingsManager`, `pillarConfigManager`, `i18n` are module-level singletons

### Adding a new language

Open `js/i18n.js`, duplicate the `es: { ... }` block, change the key name, and translate. Then add the new locale to the `toggle()` method.

---

## 🙋 FAQ

**Q: Will it work on a tablet / iPad for mobile entry?**
A: Yes. The layout is responsive. For best experience use landscape orientation.

**Q: What happens if the PC restarts during the month?**
A: Data is safe. `localStorage` persists through reboots. Only clearing browser data would erase it.

**Q: Can two people enter data at the same time?**
A: Not with the default setup (each browser has its own localStorage). For shared entry, use Option 2 (internal server) and sync via the daily Excel export.

**Q: Can I add a 6th or 7th pillar?**
A: Today the system supports up to 5 pillars (S, Q, C, D, P). Support for custom pillar definitions beyond these is a planned enhancement.

**Q: Is there a dark mode?**
A: Not yet — this is on the roadmap.

**Q: Does the data go to the cloud?**
A: No. Never. All data lives exclusively in the browser on the local machine.

---

## 🗺️ Roadmap

- [ ] Dark mode
- [ ] Shift-based entry (multiple entries per day)
- [ ] Action tracking (capture countermeasures linked to red days)
- [ ] Month-over-month trend comparison
- [ ] QR code to open the dashboard from a phone
- [ ] Offline-first PWA (installable as a desktop app)

---

## 🤝 Contributing

This project was built for the OpEx and Lean manufacturing community. Contributions, ideas, and feedback from practitioners in the field are especially welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Commit your changes: `git commit -m "Add: my improvement"`
4. Push and open a Pull Request

If you're not a developer but have ideas — open an **Issue** and describe what your plant needs. The community will figure out the implementation.

---

## 📜 License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

## 🙌 Acknowledgements

Built with ❤️ for the Lean and OpEx community.

If this dashboard helped your plant's daily meetings — give it a ⭐ on GitHub. It helps other practitioners find it.

---

*"You cannot manage what you cannot measure. You cannot measure what you cannot see."*
— Lean Manufacturing Principle
