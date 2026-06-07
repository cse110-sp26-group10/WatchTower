/**
 * Creates a simple hash router
 * @param {*} options renders page at path specified by routes in the outlet
 * @returns router instance
 */
export function createRouter({ routes, outlet }) {
  let activePage = null;

  function getRoute() {
    const hash = window.location.hash.slice(1);
    const [path = "/", query = ""] = hash.split("?");
    return {
      path: path || "/",
      params: new URLSearchParams(query),
    };
  }

  function render() {
    const route = getRoute();
    const Page = routes[route.path] || routes["/"];
    const target = outlet();
    if (!target || !Page) return;

    const page = new Page();
    page.route = route;
    activePage = page;
    target.replaceChildren(page);
    document.dispatchEvent(
      new CustomEvent("watchtower:route-change", { detail: route }),
    );
  }

  return {
    start() {
      window.addEventListener("hashchange", render);
      document.addEventListener("watchtower:data-update", () => {
        if (activePage?.isConnected && activePage.updatePageData) {
          activePage.updatePageData();
        }
      });
      if (!window.location.hash) {
        window.location.hash = "#/";
        return;
      }
      render();
    },
  };
}
