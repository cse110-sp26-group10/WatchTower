export class AppFooter extends HTMLElement {
  connectedCallback() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.textContent = 'WatchTower prototype - frontend rewrite skeleton';
    this.replaceChildren(footer);
  }
}

customElements.define('app-footer', AppFooter);
