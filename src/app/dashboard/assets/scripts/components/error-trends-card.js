import { relativeTime } from "../core/formatters.js";

const TIME_WINDOWS = [
  { label: "Last 2 hours", hours: 2, buckets: 12 },   
  { label: "Last 6 hours", hours: 6, buckets: 12 },   
  { label: "Last 24 hours", hours: 24, buckets: 24 }, 
  { label: "Last 7 days", hours: 168, buckets: 14 },  
  { label: "Last 30 days", hours: 720, buckets: 30 }, 
];

const DEFAULT_WINDOW_INDEX = 2;

export class ErrorTrendsCard extends HTMLElement {
  constructor() {
    super();
    this._windowIndex = DEFAULT_WINDOW_INDEX;
    this._rawErrors = [];
    this._shellBuilt = false;
  }

  set errors(value) {
    this._rawErrors = Array.isArray(value) ? value : [];
    this._shellBuilt ? this._updateData() : this._fullRender();
  }

  connectedCallback() {
    this._fullRender();
  }

  disconnectedCallback() {
    this._shellBuilt = false;
  }

  _getFilteredAndBucketedData() {
    if (!this._rawErrors?.length) return null;

    const currentWindow = TIME_WINDOWS[this._windowIndex];
    const now = Date.now();
    const cutoff = now - currentWindow.hours * 60 * 60 * 1000;

    const activeErrors = this._rawErrors.filter((err) => {
      return new Date(err.timestamp).getTime() >= cutoff;
    });

    if (!activeErrors.length) return null;

    const bucketDuration = (currentWindow.hours * 60 * 60 * 1000) / currentWindow.buckets;
    const buckets = Array.from({ length: currentWindow.buckets }, (_, i) => {
      const bucketStart = cutoff + i * bucketDuration;
      const bucketEnd = bucketStart + bucketDuration;
      return {
        start: bucketStart,
        end: bucketEnd,
        criticalCount: 0,
        warningCount: 0,
        total: 0
      };
    });

    for (const err of activeErrors) {
      const time = new Date(err.timestamp).getTime();
      const severity = err.metadata?.severity?.toLowerCase() || "critical";
      
      const bucketIndex = Math.min(
        Math.floor((time - cutoff) / bucketDuration),
        currentWindow.buckets - 1
      );

      if (bucketIndex >= 0 && bucketIndex < buckets.length) {
        if (severity === "warning") {
          buckets[bucketIndex].warningCount++;
        } else {
          buckets[bucketIndex].criticalCount++;
        }
        buckets[bucketIndex].total++;
      }
    }

    const maxTotal = Math.max(...buckets.map((b) => b.total), 1);

    return {
      buckets,
      maxTotal,
      totalCount: activeErrors.length,
      rangeStartLabel: new Date(cutoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      rangeEndLabel: "Now"
    };
  }

  _fullRender() {
    this.replaceChildren();
    this._shellBuilt = false;

    const trendData = this._getFilteredAndBucketedData();

    const wrapper = document.createElement("section");
    wrapper.className = "trends-card";

    const filterBar = document.createElement("div");
    filterBar.className = "trends-filter-bar";

    const heading = document.createElement("h2");
    heading.className = "trends-heading";
    heading.textContent = "Distribution Trend";
    filterBar.append(heading);

    const countBadge = document.createElement("span");
    countBadge.className = "trends-count-badge";
    countBadge.id = "trends-count-badge";
    countBadge.textContent = trendData ? `${trendData.totalCount} events` : "0 events";
    filterBar.append(countBadge);

    const dropdowns = document.createElement("div");
    dropdowns.className = "trends-dropdowns";
    dropdowns.append(this._buildTimeDropdown());
    filterBar.append(dropdowns);
    wrapper.append(filterBar);

    const body = document.createElement("div");
    body.id = "trends-body";
    wrapper.append(body);

    this.append(wrapper, this._styles());
    this._shellBuilt = true;

    this._renderBody(trendData);
  }

  _updateData() {
    const trendData = this._getFilteredAndBucketedData();

    const badge = this.querySelector("#trends-count-badge");
    if (badge) {
      badge.textContent = trendData ? `${trendData.totalCount} events` : "0 events";
    }

    const timeDropdown = this.querySelector(".trends-filter-container");
    const timeBtnLabel = timeDropdown?.querySelector(".trends-filter-label");
    const timeDropdownItems = timeDropdown?.querySelectorAll(".trends-filter-menu li");
    
    if (timeBtnLabel) {
      timeBtnLabel.textContent = TIME_WINDOWS[this._windowIndex].label;
    }
    if (timeDropdownItems) {
      timeDropdownItems.forEach((item, idx) => {
        if (idx === this._windowIndex) {
          item.classList.add("is-selected");
        } else {
          item.classList.remove("is-selected");
        }
      });
    }

    this._renderBody(trendData);
  }

  _renderBody(trendData) {
    const body = this.querySelector("#trends-body");
    if (!body) return;
    body.replaceChildren();

    if (!trendData) {
      const empty = document.createElement("div");
      empty.className = "trends-empty";
      empty.textContent = "No logged events within this window.";
      body.append(empty);
      return;
    }

    const barsContainer = document.createElement("div");
    barsContainer.className = "trends-bars";
    barsContainer.style.gridTemplateColumns = `repeat(${trendData.buckets.length}, minmax(0, 1fr))`;

    trendData.buckets.forEach((bucket) => {
      const barWrapper = document.createElement("div");
      barWrapper.className = "trends-bar-wrapper";

      const critHeightPct = (bucket.criticalCount / trendData.maxTotal) * 100;
      const warnHeightPct = (bucket.warningCount / trendData.maxTotal) * 100;

      // Construct a neat localized timestamp span for the tooltip display
      const timeString = `${new Date(bucket.start).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})} - ${new Date(bucket.end).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}`;

      // Build CSS-driven overlay interactive tooltip component card
      const tooltip = document.createElement("div");
      tooltip.className = "trends-tooltip";
      tooltip.innerHTML = `
        <div class="tooltip-time">${timeString}</div>
        <div class="tooltip-row"><span class="dot crit"></span> Critical: <strong>${bucket.criticalCount}</strong></div>
        <div class="tooltip-row"><span class="dot warn"></span> Warning: <strong>${bucket.warningCount}</strong></div>
        <div class="tooltip-total">Total: ${bucket.total}</div>
      `;
      barWrapper.append(tooltip);

      if (bucket.total > 0) {
        if (bucket.criticalCount > 0) {
          const critSegment = document.createElement("span");
          critSegment.className = "trends-segment is-critical";
          critSegment.style.height = `${critHeightPct}%`;
          barWrapper.append(critSegment);
        }
        if (bucket.warningCount > 0) {
          const warnSegment = document.createElement("span");
          warnSegment.className = "trends-segment is-warning";
          warnSegment.style.height = `${warnHeightPct}%`;
          barWrapper.append(warnSegment);
        }
      } else {
        const zeroPlaceholder = document.createElement("span");
        zeroPlaceholder.className = "trends-segment is-empty-tick";
        barWrapper.append(zeroPlaceholder);
      }

      barsContainer.append(barWrapper);
    });

    body.append(barsContainer);

    const range = document.createElement("div");
    range.className = "trends-range";
    range.innerHTML = `<span>${trendData.rangeStartLabel}</span><span>${trendData.rangeEndLabel}</span>`;
    body.append(range);
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
    const container = document.createElement("div");
    container.className = "trends-filter-container";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "trends-filter-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `
      <span class="trends-filter-label">${currentLabel}</span>
      <svg class="trends-filter-caret" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;

    const menu = document.createElement("ul");
    menu.className = "trends-filter-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    let outsideHandler = null;
    const close = () => {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      container.classList.remove("is-open");
      if (outsideHandler) {
        document.removeEventListener("pointerdown", outsideHandler);
        outsideHandler = null;
      }
    };

    items.forEach(({ id, label }) => {
      const item = document.createElement("li");
      item.className = `trends-filter-option${id === selectedId ? " is-selected" : ""}`;
      item.setAttribute("role", "option");
      item.textContent = label;
      item.addEventListener("click", () => {
        close();
        onSelect(id);
      });
      menu.append(item);
    });

    btn.addEventListener("click", () => {
      const opening = menu.hidden;
      if (opening) {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        container.classList.add("is-open");
        outsideHandler = (e) => {
          if (!container.contains(e.target)) close();
        };
        requestAnimationFrame(() => {
          document.addEventListener("pointerdown", outsideHandler);
        });
      } else {
        close();
      }
    });

    container.append(btn, menu);
    return container;
  }

  _styles() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        min-width: 0;
      }
      .trends-card {
        background: var(--wt-surface, #ffffff);
        border: 0.0625rem solid var(--wt-border, #e2e8f0);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        box-sizing: border-box;
        height: 100%;
      }
      .trends-filter-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
      }
      .trends-heading {
        margin: 0;
        color: var(--wt-text, #1e293b);
        font-size: 0.875rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .trends-count-badge {
        color: var(--wt-text-3, #64748b);
        font-size: 0.6875rem;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .trends-dropdowns {
        margin-left: auto;
      }
      .trends-filter-container { position: relative; }
      .trends-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: var(--wt-surface-2, #f8fafc);
        border: 0.0625rem solid var(--wt-border, #e2e8f0);
        border-radius: 0.25rem;
        color: var(--wt-text-2, #475569);
        cursor: pointer;
        font-size: 0.75rem;
        padding: 0.3rem 0.55rem;
        white-space: nowrap;
      }
      .trends-filter-container.is-open .trends-filter-btn, .trends-filter-btn:hover {
        border-color: #60a5fa;
        color: var(--wt-text, #1e293b);
      }
      .trends-filter-caret { transition: transform 0.18s ease; }
      .trends-filter-container.is-open .trends-filter-caret { transform: rotate(180deg); }
      .trends-filter-menu {
        position: absolute;
        top: calc(100% + 0.25rem);
        right: 0;
        z-index: 50;
        list-style: none;
        margin: 0;
        padding: 0.25rem;
        background: var(--wt-surface, #ffffff);
        border: 0.0625rem solid var(--wt-border, #e2e8f0);
        border-radius: 0.375rem;
        box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
        min-width: 10rem;
      }
      .trends-filter-option {
        color: var(--wt-text-2, #475569);
        cursor: pointer;
        font-size: 0.8125rem;
        padding: 0.45rem 0.65rem;
      }
      .trends-filter-option:hover, .trends-filter-option.is-selected {
        background: var(--wt-surface-2, #f8fafc);
        color: var(--wt-text, #1e293b);
      }
      .trends-filter-option.is-selected::before { content: '✓ '; }
      
      .trends-bars {
        display: grid;
        gap: 0.25rem;
        height: 5rem;
        align-items: end;
        border-bottom: 0.0625rem solid var(--wt-border, #e2e8f0);
        padding-bottom: 0.25rem;
      }
      .trends-bar-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: 100%;
        gap: 0.0625rem;
        background: rgba(0,0,0,0.02);
        border-radius: 0.125rem 0.125rem 0 0;
        position: relative; /* Context parent anchor for tooltip */
      }
      .trends-segment {
        display: block;
        width: 100%;
        min-height: 0;
      }
      .trends-segment.is-critical { background: var(--wt-danger, #ef4444); }
      .trends-segment.is-warning  { background: var(--wt-warn, #f5b800); }
      .trends-segment.is-empty-tick {
        height: 0.125rem !important;
        background: var(--wt-border, #cbd5e1);
        opacity: 0.4;
      }
      .trends-range {
        display: flex;
        justify-content: space-between;
        color: var(--wt-text-2, #475569);
        font-size: 0.725rem;
        font-weight: 600;
      }
      .trends-empty {
        padding: 1.5rem;
        color: var(--wt-text-3, #64748b);
        text-align: center;
        font-size: 0.8125rem;
      }

      /* Hover Tooltip Component Elements CSS styles */
      .trends-tooltip {
        position: absolute;
        bottom: calc(100% + 0.5rem);
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: #ffffff;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.15s ease, visibility 0.15s ease;
        z-index: 100;
        box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.25);
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      
      /* Subtle triangular speech bubble arrow anchor layout pointing down to active bar */
      .trends-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0.25rem;
        border-style: solid;
        border-color: #1e293b transparent transparent transparent;
      }

      .trends-bar-wrapper:hover {
        background: rgba(0,0,0,0.06);
      }

      .trends-bar-wrapper:hover .trends-tooltip {
        opacity: 1;
        visibility: visible;
      }

      .tooltip-time {
        font-weight: 600;
        color: #94a3b8;
        border-bottom: 0.0625rem solid #334155;
        padding-bottom: 0.15rem;
        margin-bottom: 0.15rem;
      }
      .tooltip-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .tooltip-row .dot {
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 50%;
      }
      .tooltip-row .dot.crit { background: #ef4444; }
      .tooltip-row .dot.warn { background: #f5b800; }
      .tooltip-total {
        font-weight: 700;
        margin-top: 0.15rem;
        color: #f8fafc;
      }
    `;
    return style;
  }
}

customElements.define("error-trends-card", ErrorTrendsCard);