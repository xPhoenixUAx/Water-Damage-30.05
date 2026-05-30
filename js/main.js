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
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  function renderServiceDetail() {
    const mount = document.querySelector("[data-service-detail]");
    if (!mount) return;
    const slug = document.body.dataset.service || new URLSearchParams(location.search).get("service") || services[0].slug;
    const service = services.find((item) => item.slug === slug) || services[0];
    const related = services.filter((item) => item.slug !== service.slug).slice(0, 4);
    document.title = `${service.title} | ${config.companyName}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = service.summary;
    mount.innerHTML = `
      <section class="page-hero service-hero">
        <div class="container hero-grid">
          <div class="hero-copy reveal">
            <span class="section-kicker">Independent provider connection</span>
            <h1>${service.title}</h1>
            <p>${service.summary} ${config.companyName} helps you compare local service options and request information from independent companies.</p>
            <div class="cta-row">
              <a class="btn btn-primary" data-phone-button href="tel:${config.phone}">${config.phoneButtonLabel}</a>
              <a class="btn btn-secondary" href="../contact.html">${config.ctaPrimary}</a>
            </div>
            <p class="micro-note">${config.disclaimerShort}</p>
          </div>
          <figure class="hero-media reveal">
            <img src=".${service.heroImage}" alt="${service.alt}">
          </figure>
        </div>
      </section>
      <section class="section">
        <div class="container split-layout">
          <div class="section-copy reveal">
            <span class="section-kicker">Overview</span>
            <h2>What this service may involve</h2>
            <p>${service.summary} A selected independent provider may inspect affected areas, explain possible drying needs, document findings, and outline next steps before work begins.</p>
            <p>${config.companyName} does not perform restoration work directly. The goal is to help property owners find local provider options and ask better questions before hiring.</p>
          </div>
          <figure class="image-panel reveal">
            <img src=".${service.detailImage}" alt="${service.title} detail image">
          </figure>
        </div>
      </section>
      <section class="section muted">
        <div class="container three-column">
          <div class="info-block reveal"><h2>Common causes</h2><ul>${listItems(service.causes)}</ul></div>
          <div class="info-block reveal"><h2>Signs to watch for</h2><ul>${listItems(service.signs)}</ul></div>
          <div class="info-block reveal"><h2>What to do immediately</h2><ul>${listItems(service.immediate)}</ul></div>
        </div>
      </section>
      <section class="section">
        <div class="container process-layout">
          <div class="section-copy reveal">
            <span class="section-kicker">Provider process</span>
            <h2>Typical next steps</h2>
            <p>Independent providers set their own process, pricing, scheduling, and work standards. These are common steps to ask about.</p>
          </div>
          <ol class="timeline reveal">${service.process.map((step) => `<li>${step}</li>`).join("")}</ol>
        </div>
      </section>
      <section class="section muted">
        <div class="container editorial-pair">
          <div class="info-block reveal">
            <h2>Equipment and methods</h2>
            <p>${service.equipment}</p>
          </div>
          <div class="info-block reveal">
            <h2>Insurance considerations</h2>
            <p>${service.insurance}</p>
          </div>
          <div class="info-block reveal">
            <h2>Questions to ask providers</h2>
            <ul>
              <li>Are you licensed and insured for this work in my area?</li>
              <li>Can I review a written estimate before authorizing work?</li>
              <li>How will you document moisture readings and drying progress?</li>
              <li>What work is excluded from the proposed scope?</li>
            </ul>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-heading reveal">
            <span class="section-kicker">Related services</span>
            <h2>Other provider categories to compare</h2>
          </div>
          <div class="related-list reveal">
            ${related.map((item) => `<a href="${item.slug}.html">${item.shortTitle}<span>${item.summary}</span></a>`).join("")}
          </div>
        </div>
      </section>
      <section class="section muted">
        <div class="container faq-wrap reveal">
          <span class="section-kicker">FAQ</span>
          <h2>Common questions</h2>
          ${service.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}
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
