import type { ClientModule } from "@docusaurus/types";

// Docusaurus opens the sidebar scrolled to the top, so deep links into long
// categories (e.g. the settings reference) leave the current entry off-screen.
function revealActiveSidebarLink() {
  const nav = document.querySelector<HTMLElement>(
    ".theme-doc-sidebar-container nav.menu",
  );
  const active = nav?.querySelector<HTMLElement>(
    '.menu__link[aria-current="page"]',
  );
  if (!nav || !active) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const linkRect = active.getBoundingClientRect();
  if (linkRect.top >= navRect.top && linkRect.bottom <= navRect.bottom) {
    return;
  }

  nav.scrollTop += linkRect.top - navRect.top - navRect.height / 3;
}

const clientModule: ClientModule = {
  onRouteDidUpdate({ location, previousLocation }) {
    if (previousLocation?.pathname === location.pathname) {
      return;
    }
    // Categories holding the new page expand during the update; measure after layout.
    requestAnimationFrame(() => requestAnimationFrame(revealActiveSidebarLink));
  },
};

export default clientModule;
