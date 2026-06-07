const SVG_NS = "http://www.w3.org/2000/svg";

// Color palette specifically for differentiating page paths matching dashboard guidelines
const PALETTE = [
  "var(--brand-aqua, #00c8ff)",
  "var(--brand-orange, #ff7a00)",
  "var(--brand-gold, #f5b800)",
  "var(--brand-indigo-contrast, #2c519b)",
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#10b981"  // Emerald
];

export class ErrorDistributionChart extends HTMLElement {
  set errors(value) {
    this._errors = Array.isArray(value) ? value : [];
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();

    const errors = this._errors || [];
    if (!errors.length) {
      const empty = document.createElement("div");
      empty.className = "activity-empty";
      empty.textContent = "No error source distributions recorded";
      this.append(empty);
      return;
    }

    // Step 1: Aggregate distributions by page pathname
    const pathCounts = {};
    errors.forEach(err => {
      const path = err.pathname || "unknown";
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    });

    // Step 2: Sort and slice down to top 5 to keep the visual breakdown clean
    const sortedData = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    const totalErrors = sortedData.reduce((sum, item) => sum + item.count, 0);
    
    // Group everything past the top 5 into "Other"
    let displaySlices = sortedData.slice(0, 5);
    if (sortedData.length > 5) {
      const otherCount = sortedData.slice(5).reduce((sum, item) => sum + item.count, 0);
      displaySlices.push({ path: "Other Paths", count: otherCount });
    }

    // Step 3: Render structural layout using panel-section wrapper
    const panel = document.createElement("panel-section");
    panel.setAttribute("heading", "Distribution by Path");
    panel.setAttribute("subheading", "Proportion of total errors page-wise");

    const container = document.createElement("div");
    container.className = "pie-chart-wrapper";

    const svgContainer = document.createElement("div");
    svgContainer.className = "pie-svg-container";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("class", "pie-svg");

    const legend = document.createElement("div");
    legend.className = "pie-legend-grid";

    // Step 4: Draw programmatic SVG Arcs
    let accumulatedAngle = 0;

    displaySlices.forEach((slice, idx) => {
      const percentage = slice.count / totalErrors;
      const angle = percentage * 360;
      const color = PALETTE[idx % PALETTE.length];
      let sliceEl;

      if (angle === 360) {
        // Handle single-source edge case
        sliceEl = document.createElementNS(SVG_NS, "circle");
        sliceEl.setAttribute("cx", "100");
        sliceEl.setAttribute("cy", "100");
        sliceEl.setAttribute("r", "70");
        sliceEl.setAttribute("fill", color);
        sliceEl.setAttribute("class", `pie-slice-node node-idx-${idx}`);
        svg.appendChild(sliceEl);
      } else if (angle > 0) {
        sliceEl = this._createArcPath(100, 100, 70, accumulatedAngle, accumulatedAngle + angle);
        sliceEl.setAttribute("fill", color);
        sliceEl.setAttribute("class", `pie-slice-node node-idx-${idx}`);
        svg.appendChild(sliceEl);
      }

      accumulatedAngle += angle;

      // Add a corresponding legend row entry with an integrated robust HTML CSS tooltip inside it
      const legendItem = document.createElement("div");
      legendItem.className = "pie-legend-item";
      legendItem.innerHTML = `
        <span class="pie-legend-bullet" style="background: ${color}"></span>
        <span class="pie-legend-text" title="${slice.path}">${slice.path}</span>
        <span class="pie-legend-value">${slice.count}</span>
        
        <div class="pie-grid-tooltip">
          <div class="pie-tip-path">${slice.path}</div>
          <div class="pie-tip-metric">Errors: <strong>${slice.count}</strong> (${(percentage * 100).toFixed(1)}%)</div>
        </div>
      `;

      // Bridge connection: hovering items highlights corresponding SVG slices cleanly
      if (sliceEl) {
        legendItem.addEventListener("mouseenter", () => sliceEl.classList.add("is-hovered"));
        legendItem.addEventListener("mouseleave", () => sliceEl.classList.remove("is-hovered"));
        
        sliceEl.addEventListener("mouseenter", () => legendItem.classList.add("is-svg-hovered"));
        sliceEl.addEventListener("mouseleave", () => legendItem.classList.remove("is-svg-hovered"));
      }

      legend.appendChild(legendItem);
    });

    svgContainer.appendChild(svg);
    container.append(svgContainer, legend);
    panel.appendChild(container);
    this.append(panel, this._styles());
  }

  _createArcPath(cx, cy, r, startAngle, endAngle) {
    const rad = Math.PI / 180;
    const x1 = cx + r * Math.cos(startAngle * rad);
    const y1 = cy + r * Math.sin(startAngle * rad);
    const x2 = cx + r * Math.cos(endAngle * rad);
    const y2 = cy + r * Math.sin(endAngle * rad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    return path;
  }

  _styles() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        min-width: 0;
      }
      .pie-chart-wrapper {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding: 0.5rem 0;
        position: relative;
      }
      .pie-svg-container {
        position: relative;
        width: 140px;
        height: 140px;
        flex-shrink: 0;
      }
      .pie-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg); /* Starts rendering slices neatly at 12 o'clock */
      }
      .pie-slice-node {
        transition: opacity 0.12s ease, transform 0.12s ease, fill 0.12s ease;
      }
      .pie-slice-node.is-hovered,
      .pie-slice-node:hover {
        opacity: 0.85;
      }
      .pie-legend-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
      }
      .pie-legend-item {
        display: flex;
        align-items: center;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.8rem;
        color: #1e293b;
        gap: 0.5rem;
        position: relative;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background 0.12s ease;
      }
      
      .pie-legend-item:hover,
      .pie-legend-item.is-svg-hovered {
        background: rgba(226, 232, 240, 0.5);
      }

      .pie-legend-bullet {
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .pie-legend-text {
        color: #475569;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      .pie-legend-value {
        font-weight: 700;
        color: #0f172a;
        margin-left: auto;
        padding-left: 0.5rem;
      }

      /* CSS Anchored Tooltip Architecture matching your standard components design */
      .pie-grid-tooltip {
        position: absolute;
        bottom: 125%;
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
        z-index: 100; /* Layers cleanly in front of everything else */
        box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        text-align: center;
      }

      /* Trigger tooltip reliably on either legend row hover or raw SVG chunk hover */
      .pie-legend-item:hover .pie-grid-tooltip,
      .pie-legend-item.is-svg-hovered .pie-grid-tooltip {
        opacity: 1;
        visibility: visible;
      }

      /* Downward pointing structural arrow node */
      .pie-grid-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0.25rem;
        border-style: solid;
        border-color: #1e293b transparent transparent transparent;
      }

      .pie-tip-path {
        font-weight: 600;
        color: #94a3b8;
        border-bottom: 0.0625rem solid #334155;
        padding-bottom: 0.1rem;
        margin-bottom: 0.1rem;
      }
      .pie-tip-metric strong {
        color: var(--brand-aqua, #00c8ff);
      }

      @media (max-width: 30rem) {
        .pie-chart-wrapper {
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      }
    `;
    return style;
  }
}

customElements.define("error-distribution-chart", ErrorDistributionChart);