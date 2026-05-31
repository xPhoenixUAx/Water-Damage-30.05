(function () {
  const config = window.SITE_CONFIG || {};
  const services = window.WFC_SERVICES || [];

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value || "";
    });
  };

  const setLink = (selector, href, text) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.href = href || "#";
      if (text) node.textContent = text;
    });
  };

  function hydrateConfig() {
    setText("[data-company-name]", config.companyName);
    setText("[data-company-id]", config.companyId);
    setText("[data-company-address]", `${config.addressLine1} - ${config.addressLine2}`);
    setText("[data-footer-text-primary]", config.footerTextPrimary);
    setText("[data-footer-text-secondary]", config.footerTextSecondary);
    setText("[data-disclaimer-short]", config.disclaimerShort);
    setText("[data-disclaimer-full]", config.disclaimerFull);
    setText("[data-current-year]", new Date().getFullYear());
    setText("[data-copyright-line]", config.copyrightLine);
    setText("[data-business-hours]", config.businessHours);
    setLink("[data-phone-link]", `tel:${config.phone}`, config.phoneDisplay);
    setLink("[data-phone-button]", `tel:${config.phone}`, config.phoneButtonLabel || config.phoneDisplay);
    setLink("[data-email-link]", `mailto:${config.email}`, config.email);
    document.querySelectorAll("[data-cta-primary]").forEach((node) => {
      node.textContent = config.ctaPrimary;
    });
    document.querySelectorAll("[data-cta-secondary]").forEach((node) => {
      node.textContent = config.ctaSecondary;
    });
  }

  function serviceUrl(slug) {
    return location.pathname.includes("/services/") ? `./${slug}.html` : `./services/${slug}.html`;
  }

  function servicesDirectoryUrl() {
    return location.pathname.includes("/services/") ? `../services.html` : `./services.html`;
  }

  function renderServiceLinks() {
    document.querySelectorAll("[data-service-links]").forEach((container) => {
      const compact = container.dataset.serviceLinks === "compact";
      const footerSlugs = [
        "emergency-water-damage-response",
        "water-extraction",
        "structural-drying",
        "moisture-inspection"
      ];
      const links = compact
        ? services.filter((service) => footerSlugs.includes(service.slug))
        : services;
      container.innerHTML = links.map((service) => (
        `<a class="${compact ? "footer-link" : "service-index-link"}" href="${serviceUrl(service.slug)}">${service.shortTitle}</a>`
      )).join("") + (compact ? `<a class="footer-link footer-link-emphasis" href="${servicesDirectoryUrl()}">All services</a>` : "");
    });
  }

  function serviceDropdownLinks(className) {
    const links = services.map((service) => (
      `<a class="${className}" href="${serviceUrl(service.slug)}">${service.title}</a>`
    )).join("");
    return `${links}<a class="${className} is-all-services" href="${servicesDirectoryUrl()}">All Services</a>`;
  }

  function renderServiceDropdowns() {
    document.querySelectorAll(".desktop-nav").forEach((nav) => {
      const servicesLink = [...nav.querySelectorAll("a")].find((link) => (
        link.textContent.trim().toLowerCase() === "services"
      ));
      if (!servicesLink || servicesLink.closest(".nav-dropdown")) return;

      const dropdown = document.createElement("div");
      dropdown.className = "nav-dropdown";
      dropdown.innerHTML = `
        <button class="nav-dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">Services</button>
        <div class="nav-dropdown-menu" role="menu">
          ${serviceDropdownLinks("nav-dropdown-link")}
        </div>`;
      servicesLink.replaceWith(dropdown);
    });

    document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
      const trigger = dropdown.querySelector(".nav-dropdown-trigger");
      if (!trigger || trigger.dataset.dropdownReady) return;
      trigger.dataset.dropdownReady = "true";

      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = dropdown.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });
    });

    document.querySelectorAll(".mobile-menu nav").forEach((nav) => {
      const servicesLink = [...nav.querySelectorAll("a")].find((link) => (
        link.textContent.trim().toLowerCase() === "services"
      ));
      if (!servicesLink || servicesLink.closest(".mobile-services-dropdown")) return;

      const dropdown = document.createElement("details");
      dropdown.className = "mobile-services-dropdown";
      dropdown.innerHTML = `
        <summary>Services</summary>
        <div class="mobile-services-list">
          ${serviceDropdownLinks("mobile-service-link")}
        </div>`;
      servicesLink.replaceWith(dropdown);
    });
  }

  function organizeFooterLegalLinks() {
    document.querySelectorAll(".site-footer").forEach((footer) => {
      const footerBottom = footer.querySelector(".footer-bottom");
      if (!footerBottom || footerBottom.querySelector(".footer-legal-links")) return;

      const legalLinks = [...footer.querySelectorAll("a.footer-link")].filter((link) => (
        /(?:privacy|terms|cookie)\.html$/.test(link.getAttribute("href") || "")
      ));
      if (!legalLinks.length) return;

      const legalNav = document.createElement("nav");
      legalNav.className = "footer-legal-links";
      legalNav.setAttribute("aria-label", "Legal links");

      legalLinks.forEach((link) => {
        const clone = link.cloneNode(true);
        clone.classList.remove("footer-link");
        clone.classList.add("footer-legal-link");
        legalNav.appendChild(clone);

        const column = link.closest(".footer-grid > div");
        link.remove();

        if (!column) return;
        const title = column.querySelector(".footer-title");
        const remainingLinks = column.querySelectorAll("a").length;
        const remainingText = [...column.childNodes].some((node) => (
          node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        ));
        if (title && title.textContent.trim() === "Legal") {
          if (remainingLinks) {
            title.textContent = "Contact";
          } else if (!remainingText) {
            column.remove();
          }
        }
      });

      footerBottom.insertBefore(legalNav, footerBottom.children[1] || null);
    });
  }

  function renderServiceDirectory() {
    const directory = document.querySelector("[data-services-directory]");
    if (!directory) return;
    directory.innerHTML = `
      <section class="services-directory-layout reveal">
        <div class="services-directory-intro">
          <span class="section-kicker">Service directory</span>
          <h2>Water damage services by situation</h2>
          <p>Keep the main categories in view while you scan specific provider options for leaks, flooding, drying, hidden moisture, and commercial properties.</p>
          <a class="btn btn-primary" href="./contact.html" data-cta-primary>${config.ctaPrimary || "Request provider options"}</a>
        </div>
        <div class="services-scroll-list" aria-label="Water damage service categories">
          ${services.map((service) => `<article class="service-scroll-card">
            <a class="service-card-body" href="${serviceUrl(service.slug)}">
              <img src="${service.heroImage}" alt="${service.alt}">
              <div class="service-card-copy">
                <span>${service.group}</span>
                <h3>${service.title}</h3>
                <p>${service.summary}</p>
              </div>
            </a>
          </article>`).join("")}
        </div>
      </section>`;
  }

  function listItems(items) {
    return items.map((item) => `<li>${iconSvg("check")}<span>${item}</span></li>`).join("");
  }

  function cardListItems(items) {
    return items.map((item) => `<li class="service-list-card">${iconSvg("check")}<span>${item}</span></li>`).join("");
  }

  function iconSvg(name) {
    const icons = {
      source: '<path d="M12 3v18"/><path d="M5 8h14"/><path d="M7 8l2 11h6l2-11"/><path d="M9 5h6"/>',
      moisture: '<path d="M12 3s6 6.1 6 10.2A6 6 0 0 1 6 13.2C6 9.1 12 3 12 3Z"/><path d="M9.6 14.2A2.7 2.7 0 0 0 12 16.5"/>',
      drying: '<path d="M4 12h10a4 4 0 1 0-4-4"/><path d="M4 18h13a3 3 0 1 0-3-3"/><path d="M4 6h4"/>',
      scope: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h6"/><path d="M9.5 17h4"/>',
      local: '<path d="M12 21s6-5.3 6-11a6 6 0 0 0-12 0c0 5.7 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
      record: '<path d="M8 4h9a2 2 0 0 1 2 2v14H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 17h11"/><path d="M9.5 8.5h5"/><path d="M9.5 12h6.5"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      cause: '<path d="M12 2v6"/><path d="M12 16v6"/><path d="M4.9 4.9l4.2 4.2"/><path d="m14.9 14.9 4.2 4.2"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="m4.9 19.1 4.2-4.2"/><path d="m14.9 9.1 4.2-4.2"/>',
      signs: '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
      immediate: '<path d="M13 2 4 14h7l-1 8 10-13h-7z"/>',
      phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
      alert: '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
      waves: '<path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M4 7h16"/><path d="M7 4h10"/>',
      extractor: '<path d="M4 17h9"/><path d="M13 17c0-4 2-7 6-8"/><path d="M19 9l2 3"/><path d="M5 13h4a3 3 0 0 1 3 3v1"/><path d="M5 13V8h5"/><circle cx="6" cy="19" r="1.5"/><circle cx="13" cy="19" r="1.5"/>',
      fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c1.8-3.4 4.5-4.8 6-3.5 1.4 1.3.7 4.1-3.8 5.5"/><path d="M10.3 13c-3.9.1-6.4-1.6-6.1-3.5.4-1.9 3-2.7 6.2.7"/><path d="M13.4 13.1c2.1 3.3 2 6.3.2 6.9-1.8.6-3.9-1.4-3.2-5.8"/>',
      gauge: '<path d="M4 14a8 8 0 1 1 16 0"/><path d="M12 14l4-4"/><path d="M7 14h10"/><path d="M8 18h8"/>',
      home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
      pipe: '<path d="M4 8h8a4 4 0 0 1 4 4v8"/><path d="M16 12h4"/><path d="M4 6v4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M14 20h4"/><path d="M12 20h8"/>',
      appliance: '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M9 7h.01"/><path d="M12 7h3"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>',
      building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 8h2a2 2 0 0 1 2 2v11"/><path d="M8 7h4"/><path d="M8 11h4"/><path d="M8 15h4"/><path d="M3 21h18"/>',
      badge: '<path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6z"/><path d="m9 12 2 2 4-5"/>',
      estimate: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h5"/><path d="M9.5 17h3"/><path d="M5 7H3v14h10v-2"/>',
      tools: '<path d="m14.7 6.3 3 3"/><path d="m3 21 8.3-8.3"/><path d="m14 7 3-3 3 3-3 3"/><path d="M5 8l3-3"/><path d="m8 5 2 2"/><path d="m4 9 6 6"/>',
      camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3z"/><circle cx="12" cy="13" r="3"/>'
    };
    return `<svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.check}</svg>`;
  }

  function serviceNavIcon(service) {
    const iconsBySlug = {
      "emergency-water-damage-response": "alert",
      "flood-damage-restoration": "waves",
      "water-extraction": "extractor",
      "structural-drying": "fan",
      "moisture-inspection": "gauge",
      "ceiling-water-damage": "home",
      "basement-water-damage": "home",
      "burst-pipe-water-damage": "pipe",
      "appliance-leak-damage": "appliance",
      "sewage-cleanup-information": "shield",
      "mold-prevention-after-water-damage": "moisture",
      "commercial-water-damage-services": "building"
    };
    return iconsBySlug[service.slug] || "moisture";
  }

  function renderServiceDetail() {
    const mount = document.querySelector("[data-service-detail]");
    if (!mount) return;
    const slug = document.body.dataset.service || new URLSearchParams(location.search).get("service") || services[0].slug;
    const service = services.find((item) => item.slug === slug) || services[0];
    const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);
    const supportImage = service.supportImage || "./img/services/provider-support-call-generated.png";
    const documentationImage = service.documentationImage || "./img/services/moisture-documentation-generated.png";
    const planningImage = service.planningImage || "./img/services/restoration-planning-strategy-generated.png";
    const benefitCards = [
      ["source", "Source review", "Discuss the visible source, timing, affected rooms, and safety concerns before work begins."],
      ["moisture", "Moisture checks", "Ask how the provider will inspect surfaces, cavities, flooring, and hidden damp areas."],
      ["drying", "Drying guidance", "Compare drying recommendations, equipment plans, and how progress will be documented."],
      ["scope", "Written scope", "Request written pricing, exclusions, and the expected sequence of steps before authorizing work."],
      ["local", "Local availability", "Review arrival windows, service area, credentials, and insurance information from each provider."],
      ["record", "Record keeping", "Keep photos, estimates, moisture notes, invoices, and provider communications together."]
    ];
    const infoPanels = [
      ["cause", "Common causes", "Start by matching the visible damage to the likely source before comparing provider recommendations.", service.causes],
      ["signs", "Signs to watch for", "Use these symptoms to explain the situation clearly when speaking with local providers.", service.signs],
      ["immediate", "What to do immediately", "These early actions can help reduce risk while you wait for professional guidance.", service.immediate]
    ];
    document.title = `${service.title} | ${config.companyName}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = service.summary;
    mount.innerHTML = `
      <section class="service-detail-hero" style="--service-hero-image: url('.${service.heroImage}')">
        <div class="container service-detail-hero-inner reveal">
          <span class="service-hero-label">${service.group}</span>
          <h1>${service.title}</h1>
          <nav class="service-breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Home</a>
            <span aria-hidden="true">/</span>
            <a href="../services.html">Services</a>
            <span aria-hidden="true">/</span>
            <span>${service.shortTitle}</span>
          </nav>
        </div>
      </section>
      <section class="service-detail-main section">
        <div class="container service-detail-layout">
          <aside class="service-detail-sidebar reveal">
            <nav class="service-side-nav" aria-label="Water damage services">
              ${services.map((item) => `<a class="${item.slug === service.slug ? "is-active" : ""}" href="${item.slug}.html">${iconSvg(serviceNavIcon(item))}<span>${item.shortTitle}</span></a>`).join("")}
            </nav>
            <div class="service-help-card">
              <img src=".${supportImage}" alt="Property owner comparing water damage provider information by phone.">
              <div class="service-help-body">
                <span class="service-help-icon">${iconSvg("phone")}</span>
                <strong>Need provider options?</strong>
                <a data-phone-link href="tel:${config.phone}">${config.phoneDisplay}</a>
              </div>
            </div>
          </aside>
          <div class="service-detail-content-flow">
          <article class="service-detail-content reveal">
            <figure class="service-feature-image">
              <img src=".${service.detailImage}" alt="${service.title} detail image">
            </figure>
            <div class="service-copy-panel">
              <div class="service-copy-icon">${iconSvg("moisture")}</div>
              <p class="service-lead">${service.summary} ${config.companyName} helps property owners compare independent local service options and request information before choosing a company.</p>
              <p>A selected provider may inspect affected areas, explain drying or cleanup needs, document findings, and outline next steps before work begins. The platform does not perform restoration work directly.</p>
              <h2>Why this service matters</h2>
              <p>Water damage can spread beyond the first visible area. Use the questions and comparison points below to better understand possible causes, warning signs, immediate actions, and documentation needs.</p>
            </div>
          </article>
          <section class="service-benefits service-detail-section service-panel">
          <div class="service-section-heading reveal">
            <span class="section-kicker">Comparison points</span>
            <h2>Benefits of careful provider review</h2>
          </div>
          <div class="service-benefit-grid">
            ${benefitCards.map(([icon, title, text]) => `<div class="service-benefit-card reveal"><span>${iconSvg(icon)}</span><h3>${title}</h3><p>${text}</p></div>`).join("")}
          </div>
          </section>
          <section class="service-planning service-detail-section service-photo-panel">
            <div class="service-planning-grid">
          <figure class="service-planning-image reveal">
            <img src=".${planningImage}" alt="Provider reviewing a water damage drying plan with a homeowner.">
          </figure>
          <div class="service-planning-copy reveal">
            <span class="section-kicker">Planning and strategy</span>
            <h2>Prepare before authorizing work</h2>
            <p>${service.insurance}</p>
            <ul>
              <li>${iconSvg("badge")}<span>Ask for license and insurance details.</span></li>
              <li>${iconSvg("estimate")}<span>Request a written estimate before approval.</span></li>
              <li>${iconSvg("tools")}<span>Clarify equipment, drying, cleanup, and exclusions.</span></li>
              <li>${iconSvg("camera")}<span>Keep photos and written records for your file.</span></li>
            </ul>
          </div>
            </div>
          </section>
          <section class="service-info-bands service-detail-section">
            <div class="service-info-grid">
          ${infoPanels.map(([icon, title, description, items]) => `<div class="service-info-panel reveal"><div class="service-info-title">${iconSvg(icon)}<div><h2>${title}</h2><p>${description}</p></div></div><ul>${cardListItems(items)}</ul></div>`).join("")}
            </div>
          </section>
          <section class="service-process service-detail-section service-panel">
            <div class="service-process-grid">
          <div class="service-section-heading reveal">
            <span class="section-kicker">Provider process</span>
            <h2>Typical next steps</h2>
            <p>Independent providers set their own process, pricing, scheduling, and work standards. These are common steps to ask about.</p>
            <figure class="service-inline-image">
              <img src=".${documentationImage}" alt="Provider documenting moisture readings and drying progress.">
            </figure>
          </div>
          <ol class="service-step-list reveal">${service.process.map((step) => `<li>${step}</li>`).join("")}</ol>
            </div>
          </section>
          <section class="service-related service-detail-section">
          <div class="section-heading reveal">
            <span class="section-kicker">Related services</span>
            <h2>Other provider categories to compare</h2>
          </div>
          <div class="related-list reveal">
            ${related.map((item) => `<a href="${item.slug}.html"><img src=".${item.heroImage}" alt="${item.shortTitle}"><strong>${item.shortTitle}</strong><span>${item.summary}</span></a>`).join("")}
          </div>
          </section>
          <section class="service-faq service-detail-section">
            <div class="faq-wrap reveal">
          <span class="section-kicker">FAQ</span>
          <h2>Common questions</h2>
          ${service.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}
            </div>
          </section>
        </div>
        </div>
      </section>
      <section class="final-cta">
        <div class="container final-cta-inner reveal">
          <h2>Compare local ${service.shortTitle.toLowerCase()} options</h2>
          <p>Quick action can help reduce further damage. Ask providers about licensing, insurance, availability, written terms, and documentation.</p>
          <div class="cta-row">
            <a class="btn btn-primary" data-phone-button href="tel:${config.phone}">${config.phoneButtonLabel}</a>
            <a class="btn btn-secondary" href="../contact.html">${config.ctaSecondary}</a>
          </div>
        </div>
      </section>`;
    hydrateConfig();
  }

  function initHeader() {
    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    const closeButton = document.querySelector("[data-menu-close]");
    if (header) {
      if (!header.querySelector(".utility-bar")) {
        header.insertAdjacentHTML("afterbegin", '<div class="utility-bar"><div class="utility-inner"></div></div>');
      }
      const utilityInner = header.querySelector(".utility-inner");
      if (utilityInner) {
        utilityInner.innerHTML = `
          <div class="utility-left">
            <a class="utility-link" data-phone-link href="tel:${config.phone || ""}"><span class="utility-icon">TEL</span>${config.phoneDisplay || ""}</a>
            <a class="utility-link" data-email-link href="mailto:${config.email || ""}"><span class="utility-icon">MAIL</span>${config.email || ""}</a>
          </div>
          <div class="utility-right">
            <span class="utility-note"><span class="utility-icon">24/7</span> Water damage connection requests</span>
          </div>`;
      }
      const currentPath = location.pathname.split("/").pop() || "index.html";
      const isServiceDetail = location.pathname.includes("/services/");
      header.querySelectorAll(".desktop-nav a").forEach((link) => {
        const linkPath = new URL(link.href, location.href).pathname.split("/").pop() || "index.html";
        link.classList.toggle("is-active", linkPath === currentPath || (isServiceDetail && linkPath === "services.html"));
      });
      header.querySelectorAll(".nav-dropdown-trigger").forEach((trigger) => {
        trigger.classList.toggle("is-active", isServiceDetail || currentPath === "services.html");
      });
      document.addEventListener("click", () => {
        header.querySelectorAll(".nav-dropdown.is-open").forEach((dropdown) => {
          dropdown.classList.remove("is-open");
          const trigger = dropdown.querySelector(".nav-dropdown-trigger");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
        });
      });
      const update = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
      update();
      window.addEventListener("scroll", update, { passive: true });
    }
    if (!menuButton || !menu) return;
    const openMenu = () => {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    };
    const closeMenu = () => {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };
    menuButton.addEventListener("click", openMenu);
    if (closeButton) closeButton.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initSmoothAccordions() {
    document.querySelectorAll("details").forEach((details) => {
      if (details.dataset.smoothAccordion) return;
      const summary = details.querySelector("summary");
      if (!summary) return;

      const content = document.createElement("div");
      content.className = "accordion-content";
      while (summary.nextSibling) {
        content.appendChild(summary.nextSibling);
      }
      details.appendChild(content);
      details.dataset.smoothAccordion = "true";

      if (details.open) {
        content.style.height = "auto";
      }

      summary.addEventListener("click", (event) => {
        event.preventDefault();
        const isOpen = details.open && !details.classList.contains("is-closing");

        if (isOpen) {
          const startHeight = `${content.scrollHeight}px`;
          details.classList.add("is-closing");
          details.classList.remove("is-opening");
          content.style.height = startHeight;

          requestAnimationFrame(() => {
            content.style.height = "0px";
          });
        } else {
          details.open = true;
          details.classList.add("is-opening");
          details.classList.remove("is-closing");
          content.style.height = "0px";

          requestAnimationFrame(() => {
            content.style.height = `${content.scrollHeight}px`;
          });
        }
      });

      content.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "height") return;

        if (details.classList.contains("is-closing")) {
          details.open = false;
          details.classList.remove("is-closing");
          content.style.height = "";
          return;
        }

        details.classList.remove("is-opening");
        if (details.open) {
          content.style.height = "auto";
        }
      });
    });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
  }

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          "stroke-width": 2,
          "aria-hidden": "true"
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrateConfig();
    renderServiceLinks();
    renderServiceDropdowns();
    organizeFooterLegalLinks();
    renderServiceDirectory();
    renderServiceDetail();
    initIcons();
    initHeader();
    initSmoothAccordions();
    initReveal();
  });
})();
