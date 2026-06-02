export class PanelSection extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const heading = this.getAttribute("heading") || "";
    const subheading = this.getAttribute("subheading") || "";
    const existingBody = this.querySelector(
      ":scope > .workspace-panel-card > .data-list-container",
    );
    const content = existingBody
      ? Array.from(existingBody.childNodes)
      : Array.from(this.childNodes);

    this.replaceChildren();

    const article = document.createElement("article");
    article.className = "workspace-panel-card";

    const header = document.createElement("header");
    header.className = "workspace-panel-header";

    const title = document.createElement("h2");
    title.className = "workspace-panel-title";
    title.textContent = heading;

    const hint = document.createElement("span");
    hint.style.fontSize = "11px";
    hint.style.color = "var(--wt-text-3)";
    hint.textContent = subheading;

    const body = document.createElement("div");
    body.className = "data-list-container";
    body.append(...content);

    header.append(title, hint);
    article.append(header, body);
    this.append(article);
  }
}

customElements.define("panel-section", PanelSection);
