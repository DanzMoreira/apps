/**
 * Hub de aplicativos — GitHub Pages
 * Links centralizados em openApp() para facilitar tracking futuro.
 */

(function () {
  "use strict";

  /** Ajuste futuro dos links sociais (href="#"" até configurar). */
  const SITE = {
    social: {
      github: "#",
      x: "#",
      instagram: "#",
    },
  };

  /**
   * Resolve a URL de abertura do app.
   * Futuro: trocar store URL por https://go.meudominio.com/<id>?src=<source>
   */
  function resolveAppUrl(app, source) {
    void source; // reservado para tracking (ex.: github-pages)
    const links = app && app.links ? app.links : {};
    const platforms = Array.isArray(app.platforms) ? app.platforms : [];

    for (const platform of platforms) {
      const url = links[platform];
      if (typeof url === "string" && url.trim() !== "") {
        return url.trim();
      }
    }

    if (typeof links.ios === "string" && links.ios.trim() !== "") {
      return links.ios.trim();
    }
    if (typeof links.android === "string" && links.android.trim() !== "") {
      return links.android.trim();
    }
    if (typeof links.web === "string" && links.web.trim() !== "") {
      return links.web.trim();
    }

    return "#";
  }

  /**
   * Ponto único para abrir um aplicativo.
   * Quando o redirect de tracking existir, altere apenas resolveAppUrl / openApp.
   */
  function openApp(app, source) {
    const src = source || "github-pages";
    const url = resolveAppUrl(app, src);

    if (!url || url === "#") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function primaryPlatform(app) {
    const platforms = Array.isArray(app.platforms) ? app.platforms : [];
    if (platforms.length) return String(platforms[0]).toLowerCase();
    if (app.links && app.links.ios) return "ios";
    if (app.links && app.links.android) return "android";
    if (app.links && app.links.web) return "web";
    return "ios";
  }

  function storeLinkLabel(platform) {
    switch (String(platform).toLowerCase()) {
      case "android":
        return "Ver no Google Play →";
      case "web":
        return "Abrir →";
      case "ios":
      default:
        return "Ver na App Store →";
    }
  }

  function hasQrCode(app) {
    return typeof app.qrCode === "string" && app.qrCode.trim() !== "";
  }

  function canDownload(app) {
    return app.status === "published";
  }

  function createCard(app) {
    const article = document.createElement("article");
    article.className = "app-row";
    article.dataset.appId = app.id || "";

    const name = escapeHtml(app.name || "App");
    const subtitle = escapeHtml(app.subtitle || "");
    const description = escapeHtml(app.description || "");
    const icon = escapeHtml(app.icon || "");
    const status = app.status || "coming-soon";
    const platform = primaryPlatform(app);

    const qrBlock = hasQrCode(app)
      ? `<figure class="app-qr">
           <img src="${escapeHtml(app.qrCode.trim())}" alt="QR Code para abrir ${name}" width="80" height="80" />
           <figcaption>Escaneie para abrir</figcaption>
         </figure>`
      : "";

    let actionHtml;
    if (canDownload(app)) {
      actionHtml = `<div class="app-action">
        <button type="button" class="app-store-link js-open-app">${escapeHtml(storeLinkLabel(platform))}</button>
      </div>`;
    } else if (status === "development") {
      actionHtml = `<p class="app-status-text">Em desenvolvimento</p>`;
    } else {
      actionHtml = `<p class="app-status-text">Em breve</p>`;
    }

    article.innerHTML = `
      <img class="app-icon" src="${icon}" alt="Ícone do aplicativo ${name}" width="96" height="96" loading="lazy" />
      <div class="app-body">
        <h3>${name}</h3>
        ${subtitle ? `<p class="app-subtitle">${subtitle}</p>` : ""}
        ${description ? `<p class="app-description">${description}</p>` : ""}
        ${actionHtml}
        ${qrBlock}
      </div>
    `;

    const openBtn = article.querySelector(".js-open-app");
    if (openBtn) {
      openBtn.addEventListener("click", function () {
        openApp(app, "github-pages");
      });
    }

    return article;
  }

  function setStatus(message, isError) {
    const el = document.getElementById("apps-status");
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-error", Boolean(isError));
  }

  function applySocialLinks() {
    Object.keys(SITE.social).forEach(function (key) {
      const href = SITE.social[key];
      document.querySelectorAll('[data-social="' + key + '"]').forEach(function (link) {
        link.setAttribute("href", href || "#");
        if (href && href !== "#") {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
        } else {
          link.removeAttribute("target");
          link.setAttribute("rel", "noopener noreferrer");
          link.addEventListener("click", function (event) {
            event.preventDefault();
          });
        }
      });
    });
  }

  async function loadApps() {
    const grid = document.getElementById("apps-grid");
    if (!grid) return;

    try {
      const response = await fetch("data/apps.json", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const apps = await response.json();
      if (!Array.isArray(apps)) {
        throw new Error("apps.json deve ser um array");
      }

      grid.replaceChildren();
      apps.forEach(function (app) {
        if (app && typeof app === "object") {
          grid.appendChild(createCard(app));
        }
      });

      grid.hidden = false;
      const status = document.getElementById("apps-status");
      if (status) status.hidden = true;
    } catch (err) {
      console.error("Falha ao carregar data/apps.json:", err);
      setStatus(
        "Não foi possível carregar a lista de aplicativos. Tente atualizar a página.",
        true
      );
      grid.hidden = true;
    }
  }

  function init() {
    const year = document.getElementById("year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
    applySocialLinks();
    loadApps();
  }

  // Exposto para inspeção / evolução futura do tracking
  window.MeusApps = {
    openApp: openApp,
    resolveAppUrl: resolveAppUrl,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
