const SVG_NS = "http://www.w3.org/2000/svg";

// Fixed coordinate system; the SVG scales to its container width via CSS.
const VIEW_W = 640;
const VIEW_H = 200;
const PAD = { top: 14, right: 10, bottom: 26, left: 10 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;
const MAX_X_LABELS = 6;

/**
 * Lightweight inline-SVG time-series chart. Set `series` to an array of
 * { label, value } points (value may be null to denote a gap). The `variant`
 * attribute selects "bar" (counts) or "line" (trend) rendering.
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

    const maxValue = Math.max(...values.filter((value) => value !== null), 1);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
    svg.setAttribute("class", "ts-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      `${this.variant === "line" ? "Trend" : "Bar"} chart with ${series.length} points`,
    );

    // Baseline axis.
    const axisY = PAD.top + PLOT_H;
    svg.appendChild(
      line(PAD.left, axisY, PAD.left + PLOT_W, axisY, "ts-axis"),
    );

    if (this.variant === "line") {
      this.renderLine(svg, values, maxValue, series);
    } else {
      this.renderBars(svg, values, maxValue, series);
    }

    this.renderXLabels(svg, series, axisY);
    this.append(svg);
  }

  renderBars(svg, values, maxValue, series) {
    const n = values.length;
    const step = PLOT_W / n;
    const barWidth = step * 0.6;
    const baseY = PAD.top + PLOT_H;

    values.forEach((value, i) => {
      if (value === null) return;
      const height = (value / maxValue) * PLOT_H;
      const x = PAD.left + i * step + (step - barWidth) / 2;
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("class", "ts-bar");
      rect.setAttribute("x", x.toFixed(1));
      rect.setAttribute("y", (baseY - height).toFixed(1));
      rect.setAttribute("width", barWidth.toFixed(1));
      rect.setAttribute("height", Math.max(height, 0).toFixed(1));
      rect.appendChild(titleEl(`${series[i].label}: ${value}${this.unit}`));
      svg.appendChild(rect);
    });
  }

  renderLine(svg, values, maxValue, series) {
    const n = values.length;
    const xFor = (i) => (n === 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (n - 1)) * PLOT_W);
    const yFor = (value) => PAD.top + PLOT_H - (value / maxValue) * PLOT_H;

    // Split into contiguous segments so null gaps break the line.
    let segment = [];
    const flush = () => {
      if (segment.length > 1) {
        const polyline = document.createElementNS(SVG_NS, "polyline");
        polyline.setAttribute("class", "ts-line");
        polyline.setAttribute("points", segment.map((p) => `${p.x},${p.y}`).join(" "));
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

    // Point markers with hover labels.
    values.forEach((value, i) => {
      if (value === null) return;
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("class", "ts-dot");
      dot.setAttribute("cx", xFor(i).toFixed(1));
      dot.setAttribute("cy", yFor(value).toFixed(1));
      dot.setAttribute("r", "3");
      dot.appendChild(titleEl(`${series[i].label}: ${value}${this.unit}`));
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

function titleEl(text) {
  const title = document.createElementNS(SVG_NS, "title");
  title.textContent = text;
  return title;
}

customElements.define("time-series-chart", TimeSeriesChart);
