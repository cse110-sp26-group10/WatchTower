const TIME_WINDOWS = [
  { label: 'Last 2 hours',  hours: 2   },
  { label: 'Last 6 hours',  hours: 6   },
  { label: 'Last 24 hours', hours: 24  },
  { label: 'Last 7 days',   hours: 168 },
  { label: 'Last 30 days',  hours: 720 },
];

const DEFAULT_WINDOW_INDEX = 2;
const ALL_PROJECTS_ID      = '__all__';

export class UptimeCard extends HTMLElement {
  constructor() {
    super();
    this._windowIndex = DEFAULT_WINDOW_INDEX;
    this._projectId   = ALL_PROJECTS_ID;
    this._rawLog      = null;
    this._projects    = [];
    this._uptime      = null;
    this._shellBuilt  = false;
  }

  set uptimeLog(value) {
    this._rawLog  = Array.isArray(value) ? value : [];
    this._uptime  = null;

    if (this._projectId !== ALL_PROJECTS_ID) {
      const ids = new Set(this._rawLog.map(r => String(r.project_id)));
      if (!ids.has(this._projectId)) this._projectId = ALL_PROJECTS_ID;
    }

    this._shellBuilt ? this._updateData() : this._fullRender();
  }

  set projects(value) {
    this._projects = Array.isArray(value) ? value : [];
    this._shellBuilt ? this._updateData() : this._fullRender();
  }

  set uptime(value) {
    this._uptime   = value;
    this._rawLog   = null;
    this._projects = [];
    this._shellBuilt ? this._updateData() : this._fullRender();
  }

  connectedCallback() {
    this._fullRender();
  }

  disconnectedCallback() {
    this._shellBuilt = false;
  }

  _getProjectOptions() {
    if (!this._rawLog?.length) return [];
    const seen = new Map();
    for (const row of this._rawLog) {
      const id = String(row.project_id);
      if (!seen.has(id)) {
        const proj = this._projects.find(p => String(p.id) === id);
        let label = proj?.name;
        if (!label) { try { label = new URL(row.url).hostname; } catch { label = id; } }
        seen.set(id, label);
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }

  _processRawLog() {
    if (!this._rawLog?.length) return null;
    const { hours } = TIME_WINDOWS[this._windowIndex];
    const cutoff    = Date.now() - hours * 60 * 60 * 1000;

    let filtered = this._rawLog.filter(r => {
      const inWindow  = new Date(r.timestamp).getTime() >= cutoff;
      const inProject = this._projectId === ALL_PROJECTS_ID || String(r.project_id) === this._projectId;
      return inWindow && inProject;
    });

    if (!filtered.length) return null;
    filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const latest  = filtered[filtered.length - 1];
    const upCount = filtered.filter(r => r.is_up).length;
    const pct     = Math.round((upCount / filtered.length) * 1000) / 10;
    const avgLat  = Math.round(filtered.reduce((s, r) => s + (r.latency || 0), 0) / filtered.length);

    let name = 'Service', url = latest.url || '';
    
    // FIX: Explicitly label as "All projects" if no specific project filter is selected
    if (this._projectId === ALL_PROJECTS_ID) {
      name = 'All projects';
      url = 'Multiple endpoints';
    } else {
      const proj = this._projects.find(p => String(p.id) === String(latest.project_id));
      if (proj?.name) { name = proj.name; } else { try { name = new URL(url).hostname; } catch {} }
    }

    const MAX_BARS = 48;
    const checks   = filtered.length > MAX_BARS ? downsample(filtered, MAX_BARS) : filtered;

    return {
      name, url, category: 'HTTP',
      isHealthy: latest.is_up, uptimePercent: pct, latency: avgLat, checks,
      rangeStartLabel: fmtRange(new Date(filtered[0].timestamp)),
      rangeEndLabel:   fmtRange(new Date(latest.timestamp)),
    };
  }

  _currentUptime() {
    return this._rawLog ? this._processRawLog() : this._uptime;
  }

  _fullRender() {
    this.replaceChildren();
    this._shellBuilt = false;

    const uptime         = this._currentUptime();
    const projectOptions = this._getProjectOptions();
    const showProject    = projectOptions.length > 1;

    const wrapper = document.createElement('section');
    wrapper.className = 'uptime-card';

    const filterBar = document.createElement('div');
    filterBar.className = 'uptime-filter-bar';

    const heading = document.createElement('h2');
    heading.className = 'uptime-heading';
    heading.textContent = 'Uptime';
    filterBar.append(heading);

    const pctBadge = document.createElement('span');
    pctBadge.className = 'uptime-pct-badge';
    pctBadge.id = 'uptime-pct-badge';
    pctBadge.textContent = uptime ? `${uptime.uptimePercent}% online` : '';
    filterBar.append(pctBadge);

    const dropdowns = document.createElement('div');
    dropdowns.className = 'uptime-dropdowns';
    dropdowns.id = 'uptime-dropdowns';

    if (showProject) {
      dropdowns.append(this._buildProjectDropdown(projectOptions));
    }
    dropdowns.append(this._buildTimeDropdown());
    filterBar.append(dropdowns);
    wrapper.append(filterBar);

    const body = document.createElement('div');
    body.id = 'uptime-body';
    wrapper.append(body);

    this.append(wrapper, this._styles());
    this._shellBuilt = true;

    this._renderBody(uptime, projectOptions, showProject);
  }

  _updateData() {
    const uptime         = this._currentUptime();
    const projectOptions = this._getProjectOptions();
    const showProject    = projectOptions.length > 1;

    const badge = this.querySelector('#uptime-pct-badge');
    if (badge) badge.textContent = uptime ? `${uptime.uptimePercent}% online` : '';

    const dropdownsEl = this.querySelector('#uptime-dropdowns');
    if (dropdownsEl) {
      const existingProject = dropdownsEl.querySelector('.uptime-project-dropdown');
      if (showProject && !existingProject) {
        dropdownsEl.prepend(this._buildProjectDropdown(projectOptions));
      } else if (!showProject && existingProject) {
        existingProject.remove();
      }
    }

    // Update the Project dropdown button text label
    if (showProject) {
      const projectBtnLabel = this.querySelector('.uptime-project-dropdown .uptime-filter-label');
      if (projectBtnLabel) {
        const currentProjectLabel = this._projectId === ALL_PROJECTS_ID
          ? 'All projects'
          : (projectOptions.find(p => p.id === this._projectId)?.label ?? 'All projects');
        projectBtnLabel.textContent = currentProjectLabel;
      }
    }

    // Update the Time Window dropdown button text label
    const timeDropdown = this.querySelector('.uptime-filter-container:not(.uptime-project-dropdown)');
    const timeBtnLabel = timeDropdown?.querySelector('.uptime-filter-label');
    if (timeBtnLabel) {
      timeBtnLabel.textContent = TIME_WINDOWS[this._windowIndex].label;
    }

    this._renderBody(uptime, projectOptions, showProject);
  }

  _renderBody(uptime) {
    const body = this.querySelector('#uptime-body');
    if (!body) return;
    body.replaceChildren();

    if (!uptime) {
      const empty = document.createElement('div');
      empty.className = 'uptime-empty';
      empty.textContent = 'No uptime data for this window.';
      body.append(empty);
      return;
    }

    const top = document.createElement('div');
    top.className = 'uptime-card-top';

    const identity = document.createElement('div');
    identity.className = 'uptime-identity';
    identity.innerHTML = `
      <h3>${uptime.name}</h3>
      <p>${uptime.category} <span aria-hidden="true">•</span> ${uptime.url}</p>
    `;

    const status = document.createElement('span');
    status.className = `uptime-status ${uptime.isHealthy ? 'is-healthy' : 'is-down'}`;
    status.innerHTML = `<span class="uptime-status-dot"></span>${uptime.isHealthy ? 'Healthy' : 'Down'}`;

    top.append(identity, status);
    body.append(top);

    const metaRow = document.createElement('div');
    metaRow.className = 'uptime-meta-row';

    const latency = document.createElement('div');
    latency.className = 'uptime-latency';
    latency.textContent = `~${uptime.latency}ms avg`;
    metaRow.append(latency);
    body.append(metaRow);

    const bars = document.createElement('div');
    bars.className = 'uptime-bars';
    bars.setAttribute('aria-label', `${uptime.uptimePercent}% uptime`);
    bars.innerHTML = uptime.checks.map(c => `
      <span
        class="uptime-bar ${c.is_up ? 'is-up' : 'is-down'}"
        title="${c.is_up ? 'Up' : 'Down'} — ${c.status || 'unknown'}"
      ></span>
    `).join('');
    body.append(bars);

    const range = document.createElement('div');
    range.className = 'uptime-range';
    range.innerHTML = `<span>${uptime.rangeStartLabel}</span><span>${uptime.rangeEndLabel}</span>`;
    body.append(range);
  }

  _buildProjectDropdown(projectOptions) {
    const currentLabel = this._projectId === ALL_PROJECTS_ID
      ? 'All projects'
      : (projectOptions.find(p => p.id === this._projectId)?.label ?? 'All projects');

    const container = this._buildDropdown({
      currentLabel,
      items: [{ id: ALL_PROJECTS_ID, label: 'All projects' }, ...projectOptions],
      selectedId: this._projectId,
      onSelect: (id) => {
        this._projectId = id;
        this._updateData();
      },
    });
    container.classList.add('uptime-project-dropdown');
    return container;
  }

  _buildTimeDropdown() {
    return this._buildDropdown({
      currentLabel: TIME_WINDOWS[this._windowIndex].label,
      items: TIME_WINDOWS.map((w, i) => ({ id: String(i), label: w.label })),
      selectedId: String(this._windowIndex),
      onSelect: (id) => {
        this._windowIndex = Number(id);
        this._updateData();
      },
    });
  }

  _buildDropdown({ currentLabel, items, selectedId, onSelect }) {
    const container = document.createElement('div');
    container.className = 'uptime-filter-container';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'uptime-filter-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `
      <span class="uptime-filter-label">${currentLabel}</span>
      <svg class="uptime-filter-caret" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;

    const menu = document.createElement('ul');
    menu.className = 'uptime-filter-menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;

    let outsideHandler = null;

    const detach = () => {
      if (outsideHandler) {
        document.removeEventListener('pointerdown', outsideHandler);
        outsideHandler = null;
      }
    };

    const close = () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      container.classList.remove('is-open');
      detach();
    };

    items.forEach(({ id, label }) => {
      const item = document.createElement('li');
      item.className = `uptime-filter-option${id === selectedId ? ' is-selected' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(id === selectedId));
      item.textContent = label;
      item.addEventListener('click', () => {
        close();
        onSelect(id);
      });
      menu.append(item);
    });

    btn.addEventListener('click', () => {
      const opening = menu.hidden;

      this.querySelectorAll('.uptime-filter-menu').forEach(m => {
        if (m !== menu) {
          m.hidden = true;
          m.closest('.uptime-filter-container')?.classList.remove('is-open');
          m.closest('.uptime-filter-container')?.querySelector('.uptime-filter-btn')
            ?.setAttribute('aria-expanded', 'false');
        }
      });

      if (opening) {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        container.classList.add('is-open');

        outsideHandler = (e) => {
          if (!container.contains(e.target)) close();
        };
        requestAnimationFrame(() => {
          document.addEventListener('pointerdown', outsideHandler);
        });
      } else {
        close();
      }
    });

    container.append(btn, menu);
    return container;
  }

_styles() {
    const style = document.createElement('style');
    style.textContent = `
      :host { 
        display: block; 
        /* Enable container querying on the host so child elements monitor its actual width */
        container-type: inline-size;
        container-name: uptime-container;

        --wt-font-weight-normal: var(--wt-font-weight-regular, 400);
        --wt-font-weight-medium: var(--wt-font-weight-semi, 600);
        --wt-font-weight-bold: var(--wt-font-weight-bold, 700);
        --wt-font-weight-heavy: var(--wt-font-weight-extrabold, 800);
      }

      .uptime-card {
        background: var(--wt-surface);
        border: 0.0625rem solid var(--wt-border);
        border-radius: 0;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        min-height: 100%;
        box-sizing: border-box;
      }

      .uptime-filter-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: nowrap; /* Prevent messy mid-line wrapping */
        width: 100%;
      }

      .uptime-heading {
        margin: 0;
        color: var(--wt-text);
        font-size: 0.875rem;
        font-weight: var(--wt-font-weight-bold);
        flex-shrink: 0;
      }

      .uptime-pct-badge {
        color: var(--wt-text-3);
        font-size: 0.6875rem;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        flex: 1;
        min-width: 0; /* Allows proper flex truncation */
      }

      .uptime-dropdowns {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
        margin-left: auto;
      }

      .uptime-filter-container { position: relative; }

      .uptime-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: var(--wt-surface-2);
        border: 0.0625rem solid var(--wt-border);
        border-radius: var(--wt-radius-sm);
        color: var(--wt-text-2);
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: var(--wt-font-weight-medium);
        padding: 0.3rem 0.55rem;
        transition: border-color 0.15s, color 0.15s;
        white-space: nowrap;
        max-width: 11rem;
        overflow: hidden;
      }

      .uptime-filter-btn:hover,
      .uptime-filter-container.is-open .uptime-filter-btn {
        border-color: var(--wt-info, #60a5fa);
        color: var(--wt-text);
      }

      .uptime-filter-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .uptime-filter-caret {
        flex-shrink: 0;
        opacity: 0.6;
        transition: transform 0.18s ease;
      }

      .uptime-filter-container.is-open .uptime-filter-caret {
        transform: rotate(180deg);
        opacity: 1;
      }

      .uptime-filter-menu {
        position: absolute;
        top: calc(100% + 0.25rem);
        right: 0;
        z-index: 50;
        list-style: none;
        margin: 0;
        padding: 0.25rem;
        background: var(--wt-surface);
        border: 0.0625rem solid var(--wt-border);
        border-radius: var(--wt-radius-md);
        box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15);
        min-width: 11rem;
        animation: uptime-menu-in 0.12s ease;
      }

      @keyframes uptime-menu-in {
        from { opacity: 0; transform: translateY(-0.25rem); }
        to   { opacity: 1; transform: translateY(0);    }
      }

      .uptime-filter-option {
        border-radius: calc(var(--wt-radius-sm) - 0.0625rem);
        color: var(--wt-text-2);
        cursor: pointer;
        font-size: 0.8125rem;
        padding: 0.45rem 0.65rem;
        transition: background 0.1s;
      }

      .uptime-filter-option:hover {
        background: var(--wt-surface-2);
        color: var(--wt-text);
      }

      .uptime-filter-option.is-selected {
        color: var(--wt-text);
        font-weight: var(--wt-font-weight-bold);
        background: var(--wt-surface-2);
      }

      .uptime-filter-option.is-selected::before {
        content: '✓ ';
        opacity: 0.5;
      }

      .uptime-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .uptime-identity {
        min-width: 0; /* Vital to let long domain text properly truncate if compressed */
        flex: 1;
      }

      .uptime-identity h3 {
        margin: 0;
        color: var(--wt-text);
        font-size: 1rem;
        line-height: 1.2;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .uptime-identity p {
        margin: 0.25rem 0 0;
        color: var(--wt-text-2);
        font-size: 0.8125rem;
        font-weight: var(--wt-font-weight-medium);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .uptime-status {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        border-radius: 62.4375rem;
        color: var(--wt-status-text, #ffffff);
        font-size: 0.75rem;
        font-weight: var(--wt-heavy, 800);
        line-height: 1;
        padding: 0.45rem 0.65rem;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .uptime-status.is-healthy { background: var(--wt-success); }
      .uptime-status.is-down    { background: var(--wt-danger);  }

      .uptime-status-dot {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        background: var(--wt-status-dot-inner, rgba(255, 255, 255, 0.35));
      }

      .uptime-meta-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: -0.25rem;
      }

      .uptime-latency {
        color: var(--wt-text-2);
        font-size: 0.75rem;
        font-weight: var(--wt-font-weight-bold);
        text-align: right;
      }

      .uptime-bars {
        display: grid;
        grid-template-columns: repeat(48, minmax(0, 1fr));
        gap: 0.2rem;
        min-height: 1.75rem;
        align-items: end;
      }

      .uptime-bar {
        display: block;
        min-width: 0.125rem;
        height: 1.75rem;
        border-radius: 62.4375rem;
      }

      .uptime-bar.is-up   { background: var(--wt-success); }
      .uptime-bar.is-down { background: var(--wt-danger);  }

      .uptime-range {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: var(--wt-text-2);
        font-size: 0.75rem;
        font-weight: var(--wt-font-weight-bold);
      }

      .uptime-empty {
        padding: 1rem;
        color: var(--wt-text-3);
        text-align: center;
      }

      /* Container-Query: Handles internal layout scaling based completely on card boundary width */
      @container uptime-container (max-width: 32rem) {
        .uptime-card { padding: 1rem; }
        .uptime-filter-bar { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
        .uptime-dropdowns { margin-left: 0; width: 100%; justify-content: flex-start; }
        .uptime-pct-badge { margin-top: -0.25rem; }
        .uptime-card-top { flex-direction: column; align-items: stretch; gap: 0.75rem; }
        .uptime-status { align-self: flex-start; }
        .uptime-bars { gap: 0.125rem; }
      }
    `;
    return style;
  }
}

function downsample(arr, target) {
  const step = arr.length / target;
  return Array.from({ length: target }, (_, i) => arr[Math.floor(i * step)]);
}

function fmtRange(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000)     return 'just now';
  if (diff < 3_600_000)  return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

customElements.define('uptime-card', UptimeCard);
