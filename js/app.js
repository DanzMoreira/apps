/**
 * Hub de aplicativos — GitHub Pages
 *
 * Atribuição de origem (sessionStorage, sem cookies):
 * - ?src= / ?campaign= na entrada do hub → painel_apps_source / painel_apps_campaign
 * - Clique em app → /go/{id}?src=...&campaign=...&via=pages
 * - src explícito novo na URL substitui a atribuição da sessão
 * - navegação interna sem src preserva a origem armazenada
 */

(function () {
  "use strict";

  var STORAGE_SOURCE = "painel_apps_source";
  var STORAGE_CAMPAIGN = "painel_apps_campaign";
  var PARAM_RE = /^[a-zA-Z0-9._\-]{1,64}$/;

  var SITE = {
    trackingBaseUrl: "",
    pagesUrl: "https://danzmoreira.github.io/apps/",
    social: {
      github: "#",
      x: "#",
      instagram: "#",
      linkedin: "#",
    },
  };

  function normalizeParam(value, fallback) {
    if (value == null) return fallback;
    var cleaned = String(value).trim().toLowerCase().slice(0, 64);
    if (!cleaned) return fallback;
    if (!PARAM_RE.test(cleaned)) return fallback;
    return cleaned;
  }

  /**
   * Captura src/campaign da query.
   * Regra: src presente na URL → atualiza sessão (nova atribuição explícita).
   * Sem src → não sobrescreve com direct; preserva o que já estiver na sessão.
   */
  function captureTrafficAttribution() {
    try {
      var params = new URLSearchParams(window.location.search);
      var srcRaw = params.get("src");
      var campaignRaw = params.get("campaign");

      if (srcRaw != null && String(srcRaw).trim() !== "") {
        var src = normalizeParam(srcRaw, "direct");
        sessionStorage.setItem(STORAGE_SOURCE, src);
        if (campaignRaw != null && String(campaignRaw).trim() !== "") {
          var campaign = normalizeParam(campaignRaw, null);
          if (campaign) {
            sessionStorage.setItem(STORAGE_CAMPAIGN, campaign);
          } else {
            sessionStorage.removeItem(STORAGE_CAMPAIGN);
          }
        } else {
          sessionStorage.removeItem(STORAGE_CAMPAIGN);
        }
      }
    } catch (err) {
      console.warn("attribution: sessionStorage indisponível", err);
    }
  }

  function getStoredSource() {
    try {
      return normalizeParam(sessionStorage.getItem(STORAGE_SOURCE), null);
    } catch (err) {
      return null;
    }
  }

  function getStoredCampaign() {
    try {
      return normalizeParam(sessionStorage.getItem(STORAGE_CAMPAIGN), null);
    } catch (err) {
      return null;
    }
  }

  /** Monta URL /go/{id}?src=&campaign=&via=pages */
  function buildGoUrl(appId) {
    var base = (SITE.trackingBaseUrl || "").replace(/\/+$/, "");
    if (!base || !appId) return null;

    var src = getStoredSource() || "direct";
    var campaign = getStoredCampaign();
    var params = new URLSearchParams();
    params.set("src", src);
    if (campaign) params.set("campaign", campaign);
    params.set("via", "pages");

    return (
      base +
      "/go/" +
      encodeURIComponent(String(appId)) +
      "?" +
      params.toString()
    );
  }

  function storeFallbackUrl(app) {
    var links = app && app.links ? app.links : {};
    var platforms = Array.isArray(app.platforms) ? app.platforms : [];

    for (var i = 0; i < platforms.length; i += 1) {
      var url = links[platforms[i]];
      if (typeof url === "string" && url.trim() !== "" && url.trim() !== "#") {
        return url.trim();
      }
    }
    if (typeof links.ios === "string" && links.ios.trim() && links.ios.trim() !== "#") {
      return links.ios.trim();
    }
    if (typeof links.android === "string" && links.android.trim() && links.android.trim() !== "#") {
      return links.android.trim();
    }
    if (typeof links.web === "string" && links.web.trim() && links.web.trim() !== "#") {
      return links.web.trim();
    }
    return "#";
  }

  /**
   * Preferência: tracking /go com via=pages.
   * Fallback: link da loja (se trackingBaseUrl não configurado).
   */
  function resolveAppUrl(app) {
    var go = buildGoUrl(app && app.id);
    if (go) return go;
    return storeFallbackUrl(app);
  }

  function openApp(app) {
    var url = resolveAppUrl(app);
    if (!url || url === "#") return;
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
    var platforms = Array.isArray(app.platforms) ? app.platforms : [];
    if (platforms.length) return String(platforms[0]).toLowerCase();
    if (app.links && app.links.ios) return "ios";
    if (app.links && app.links.android) return "android";
    if (app.links && app.links.web) return "web";
    return "ios";
  }

  function storeLinkLabel(platform) {
    switch (String(platform).toLowerCase()) {
      case "android":
        return "Ver no Google Play";
      case "web":
        return "Abrir";
      case "ios":
      default:
        return "Baixar na App Store";
    }
  }

  function canDownload(app) {
    return app.status === "published";
  }

  function setAppsRange(count) {
    var el = document.getElementById("apps-range");
    if (!el) return;
    if (!count) {
      el.textContent = "00";
      return;
    }
    el.textContent = "01 — " + String(count).padStart(2, "0");
  }

  function createCard(app, index) {
    var article = document.createElement("article");
    article.className = "app-row" + (app.featured ? " is-featured" : "");
    article.dataset.appId = app.id || "";

    var name = escapeHtml(app.name || "App");
    var category = escapeHtml(app.subtitle || "");
    var description = escapeHtml(app.description || "");
    var icon = typeof app.icon === "string" ? app.icon.trim() : "";
    var status = app.status || "coming-soon";
    var platform = primaryPlatform(app);
    var number = String(index + 1).padStart(2, "0");
    var resolvedUrl = resolveAppUrl(app);

    var iconHtml = icon
      ? '<img class="app-icon" src="' +
        escapeHtml(icon) +
        '" alt="Ícone do aplicativo ' +
        name +
        '" width="60" height="60" loading="lazy" />'
      : '<div class="app-icon-ph" aria-hidden="true"></div>';

    var actionHtml;
    if (canDownload(app) && resolvedUrl && resolvedUrl !== "#") {
      if (platform === "ios") {
        actionHtml =
          '<div class="app-action">' +
          '<a class="app-store-badge js-open-app" href="' +
          escapeHtml(resolvedUrl) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<img src="assets/badges/app-store-pt-br.svg" width="98" height="33" alt="' +
          escapeHtml(storeLinkLabel("ios")) +
          '" />' +
          "</a></div>";
      } else {
        actionHtml =
          '<div class="app-action">' +
          '<a class="app-store-badge js-open-app" href="' +
          escapeHtml(resolvedUrl) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<span class="app-status-text">' +
          escapeHtml(storeLinkLabel(platform)) +
          "</span></a></div>";
      }
    } else if (status === "development") {
      actionHtml =
        '<div class="app-action"><p class="app-status-text">Em desenvolvimento</p></div>';
    } else {
      actionHtml =
        '<div class="app-action"><p class="app-status-text">Em breve</p></div>';
    }

    article.innerHTML =
      '<p class="app-index" aria-hidden="true">' +
      number +
      "</p>" +
      iconHtml +
      '<div class="app-titles">' +
      '<h2 class="app-name">' +
      name +
      "</h2>" +
      (category
        ? '<p class="app-category">' + category + "</p>"
        : "") +
      "</div>" +
      (description
        ? '<p class="app-description">' + description + "</p>"
        : '<p class="app-description"></p>') +
      actionHtml;

    var openLink = article.querySelector(".js-open-app");
    if (openLink) {
      openLink.addEventListener("click", function (event) {
        // Garante /go com via=pages mesmo se o href estiver desatualizado
        event.preventDefault();
        openApp(app);
      });
    }

    return article;
  }

  function setStatus(message, isError) {
    var el = document.getElementById("apps-status");
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-error", Boolean(isError));
  }

  function applySocialLinks() {
    Object.keys(SITE.social).forEach(function (key) {
      var href = SITE.social[key];
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

  async function loadTrackingConfig() {
    try {
      var response = await fetch("data/tracking-config.json", { cache: "no-cache" });
      if (!response.ok) return;
      var cfg = await response.json();
      if (cfg && typeof cfg.trackingBaseUrl === "string" && cfg.trackingBaseUrl.trim()) {
        SITE.trackingBaseUrl = cfg.trackingBaseUrl.trim().replace(/\/+$/, "");
      }
      if (cfg && typeof cfg.pagesUrl === "string" && cfg.pagesUrl.trim()) {
        SITE.pagesUrl = cfg.pagesUrl.trim();
      }
    } catch (err) {
      console.warn("tracking-config.json não carregado", err);
    }
  }

  async function loadApps() {
    var grid = document.getElementById("apps-grid");
    if (!grid) return;

    try {
      var response = await fetch("data/apps.json", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      var apps = await response.json();
      if (!Array.isArray(apps)) {
        throw new Error("apps.json deve ser um array");
      }

      grid.replaceChildren();
      var index = 0;
      apps.forEach(function (app) {
        if (app && typeof app === "object") {
          grid.appendChild(createCard(app, index));
          index += 1;
        }
      });

      setAppsRange(index);
      grid.hidden = false;
      var status = document.getElementById("apps-status");
      if (status) status.hidden = true;
    } catch (err) {
      console.error("Falha ao carregar data/apps.json:", err);
      setAppsRange(0);
      setStatus(
        "Não foi possível carregar a lista de aplicativos. Tente atualizar a página.",
        true
      );
      grid.hidden = true;
    }
  }

  async function init() {
    captureTrafficAttribution();
    applySocialLinks();
    await loadTrackingConfig();
    await loadApps();
  }

  window.MeusApps = {
    openApp: openApp,
    resolveAppUrl: resolveAppUrl,
    buildGoUrl: buildGoUrl,
    captureTrafficAttribution: captureTrafficAttribution,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
