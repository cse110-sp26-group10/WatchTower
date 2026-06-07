const SVG_NS = "http://www.w3.org/2000/svg";

// Fixed coordinate system; the SVG scales to its container width via CSS.
const VIEW_W = 640;
const VIEW_H = 200;
const PAD = { top: 14, right: 10, bottom: 26, left: 10 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;
const MAX_X_LABELS = 6;

/**
 * Lightweight inline-SVG time-series chart with HTML overlay hover slots that match the error-trend card model.
 */
export class TimeSeriesChart extends HTMLElement {
  static get observedAttributes() {
    return ["variant", "unit", "empty-message"];
  }

  set series(value) {
    this._series = Array.isArray(value) ? value : [];
    this.render();
  }

  get variant() {
    return this.getAttribute("variant") === "line" ? "line" : "bar";
  }

  get unit() {
    return this.getAttribute("unit") || "";
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();
    const series = this._series || [];
    const values = series.map((point) =>
      typeof point.value === "number" ? point.value : null,
    );
    const hasData = values.some((value) => value !== null);

    if (!series.length || !hasData) {
      const empty = document.createElement("div");
      empty.className = "activity-empty";
      empty.textContent = this.getAttribute("empty-message") || "No data yet";
      this.append(empty);
      return;
    }

    // Outer structural frame to match modern dashboard sizing constraints
    const container = document.createElement("div");
    container.className = "ts-chart-container";

    const maxValue = Math.max(...values.filter((value) => value !== null), 1);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
    svg.setAttribute("class", "ts-svg");
    svg.setAttribute("role", "img");

    // Baseline axis.
    const axisY = PAD.top + PLOT_H;
    svg.appendChild(line(PAD.left, axisY, PAD.left + PLOT_W, axisY, "ts-axis"));

    if (this.variant === "line") {
      this.renderLine(svg, values, maxValue);
    } else {
      this.renderBars(svg, values, maxValue);
    }

    this.renderXLabels(svg, series, axisY);
    container.appendChild(svg);

    // Build independent grid anchor elements mimicking the error card tooltip layer architecture
    const interactionGrid = document.createElement("div");
    interactionGrid.className = "ts-interaction-grid";
    interactionGrid.style.gridTemplateColumns = `repeat(${series.length}, minmax(0, 1fr))`;

    series.forEach((point, i) => {
      const cellAnchor = document.createElement("div");
      cellAnchor.className = "ts-grid-cell-anchor";

      // Calculate vertical percent from top edge to point the tooltip arrow beautifully
      const val = typeof point.value === "number" ? point.value : 0;
      const pctFromTop = 100 - ((val / maxValue) * (PLOT_H / VIEW_H) * 100 + (PAD.bottom / VIEW_H) * 100);

      // Instantly reverse tooltip if point sits near the header line to avoid hitting container constraints
      const shouldFlip = pctFromTop < 25;

      const tooltip = document.createElement("div");
      tooltip.className = `ts-grid-tooltip ${shouldFlip ? "is-flipped" : ""}`;
      
      if (shouldFlip) {
        tooltip.style.top = `calc(${pctFromTop.toFixed(1)}% + 8px)`;
        tooltip.style.bottom = "auto";
      } else {
        tooltip.style.bottom = `calc(${100 - pctFromTop.toFixed(1)}% + 8px)`;
        tooltip.style.top = "auto";
      }

      tooltip.innerHTML = `
        <div class="ts-tooltip-time">${point.label}</div>
        <div class="ts-tooltip-value">Count: <strong>${val}${this.unit}</strong></div>
      `;

      cellAnchor.appendChild(tooltip);
      
      // Let the HTML cell know which index it maps to so CSS can link hover states to SVG elements
      cellAnchor.addEventListener("mouseenter", () => {
        svg.querySelectorAll(`.node-idx-${i}`).forEach(el => el.classList.add("is-hovered"));
      });
      cellAnchor.addEventListener("mouseleave", () => {
        svg.querySelectorAll(`.node-idx-${i}`).forEach(el => el.classList.remove("is-hovered"));
      });

      interactionGrid.appendChild(cellAnchor);
    });

    container.appendChild(interactionGrid);
    this.append(container, this._styles());
  }

  renderBars(svg, values, maxValue) {
    const n = values.length;
    const step = PLOT_W / n;
    const barWidth = step * 0.6;
    const baseY = PAD.top + PLOT_H;

    values.forEach((value, i) => {
      if (value === null) return;
      const height = (value / maxValue) * PLOT_H;
      const x = PAD.left + i * step + (step - barWidth) / 2;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("class", `ts-bar node-idx-${i}`);
      rect.setAttribute("x", x.toFixed(1));
      rect.setAttribute("y", (baseY - height).toFixed(1));
      rect.setAttribute("width", barWidth.toFixed(1));
      rect.setAttribute("height", Math.max(height, 0).toFixed(1));
      svg.appendChild(rect);
    });
  }

  renderLine(svg, values, maxValue) {
    const n = values.length;
    const xFor = (i) =>
      n === 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (n - 1)) * PLOT_W;
    const yFor = (value) => PAD.top + PLOT_H - (value / maxValue) * PLOT_H;

    let segment = [];
    const flush = () => {
      if (segment.length > 1) {
        const polyline = document.createElementNS(SVG_NS, "polyline");
        polyline.setAttribute("class", "ts-line");
        polyline.setAttribute(
          "points",
          segment.map((p) => `${p.x},${p.y}`).join(" "),
        );
        svg.appendChild(polyline);
      }
      segment = [];
    };

    values.forEach((value, i) => {
      if (value === null) {
        flush();
        return;
      }
      segment.push({ x: xFor(i), y: yFor(value) });
    });
    flush();

    values.forEach((value, i) => {
      if (value === null) return;
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("class", `ts-dot node-idx-${i}`);
      dot.setAttribute("cx", xFor(i).toFixed(1));
      dot.setAttribute("cy", yFor(value).toFixed(1));
      dot.setAttribute("r", "3");
      svg.appendChild(dot);
    });
  }

  renderXLabels(svg, series, axisY) {
    const n = series.length;
    const stride = Math.max(1, Math.ceil(n / MAX_X_LABELS));
    const step = PLOT_W / n;

    series.forEach((point, i) => {
      if (i % stride !== 0 && i !== n - 1) return;
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("class", "ts-label");
      text.setAttribute("x", (PAD.left + i * step + step / 2).toFixed(1));
      text.setAttribute("y", (axisY + 16).toFixed(1));
      text.setAttribute("text-anchor", "middle");
      text.textContent = point.label;
      svg.appendChild(text);
    });
  }

  _styles() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        min-width: 0;
      }
      
      .ts-chart-container {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .ts-svg {
        display: block;
        width: 100%;
        height: auto;
      }

      /* Synchronized SVG interaction elements styling */
      .ts-bar {
        transition: fill 0.12s ease, opacity 0.12s ease;
      }
      .ts-bar.is-hovered {
        fill: var(--brand-aqua, #00c8ff) !important;
        opacity: 0.95;
      }

      .ts-dot {
        transition: r 0.12s ease, fill 0.12s ease;
      }
      .ts-dot.is-hovered {
        r: 5.5;
        fill: var(--brand-aqua, #00c8ff) !important;
      }

      /* Absolute layout layer positioned exactly over the SVG contents grid */
      .ts-interaction-grid {
        display: grid;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        /* Limit bounds precisely to graph chart interior space */
        height: calc(100% - 26px); 
        pointer-events: none;
        box-sizing: border-box;
        padding-left: calc((10 / 640) * 100%);
        padding-right: calc((10 / 640) * 100%);
      }

      .ts-grid-cell-anchor {
        height: 100%;
        position: relative;
        pointer-events: auto;
        cursor: pointer;
      }

      /* Shared interactive overlay tooltip styling matching the errors card */
      .ts-grid-tooltip {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: #ffffff;
        padding: 0.4rem 0.65rem;
        border-radius: 0.375rem;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.75rem;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.12s ease, visibility 0.12s ease;
        z-index: 100; /* Pushes the layer firmly in front of everything else */
        box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        text-align: center;
      }

      .ts-grid-cell-anchor:hover .ts-grid-tooltip {
        opacity: 1;
        visibility: visible;
      }

      /* Default downward pointer triangle arrow flag */
      .ts-grid-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0.25rem;
        border-style: solid;
        border-color: #1e293b transparent transparent transparent;
      }

      /* Upward pointer variant flag when flipped */
      .ts-grid-tooltip.is-flipped::after {
        top: auto;
        bottom: 100%;
        border-color: transparent transparent #1e293b transparent;
      }

      .ts-tooltip-time {
        font-weight: 600;
        color: #94a3b8;
        border-bottom: 0.0625rem solid #334155;
        padding-bottom: 0.1rem;
        margin-bottom: 0.1rem;
      }

      .ts-tooltip-value {
        color: #f8fafc;
      }
      
      .ts-tooltip-value strong {
        color: var(--brand-aqua, #00c8ff);
      }
    `;
    return style;
  }
}

function line(x1, y1, x2, y2, className) {
  const el = document.createElementNS(SVG_NS, "line");
  el.setAttribute("class", className);
  el.setAttribute("x1", x1);
  el.setAttribute("y1", y1);
  el.setAttribute("x2", x2);
  el.setAttribute("y2", y2);
  return el;
}

customElements.define("time-series-chart", TimeSeriesChart);