/* Theme toggle ----------------------------------------------------------- */
(function () {
  const root = document.documentElement;
  const toggles = document.querySelectorAll(".theme-toggle");
  if (!toggles.length) return;

  function paint(theme) {
    const dark = theme === "dark";
    const en = root.lang === "en";
    toggles.forEach((t) => {
      const label = t.querySelector(".theme-toggle__label");
      if (label) label.textContent = dark
        ? (en ? "Light mode" : "Světlý režim")
        : (en ? "Dark mode" : "Tmavý režim");
      t.setAttribute("aria-pressed", String(dark));
    });
  }
  paint(root.getAttribute("data-theme") || "light");

  toggles.forEach((t) =>
    t.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      paint(next);
    })
  );
})();

/* Hero video — inject the Vimeo iframe after first paint (off the LCP path) -- */
(function () {
  const media = document.querySelector("[data-hero-video]");
  if (!media || !media.dataset.src) return;
  // Phones use a CSS background photo (the iframe is display:none there); tablets get the video.
  if (matchMedia("(max-width: 600px)").matches) return;

  function inject() {
    if (media.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.className = "hero__video";
    iframe.src = media.dataset.src;
    iframe.title = media.dataset.title || "";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("tabindex", "-1");
    iframe.setAttribute("aria-hidden", "true");
    media.insertBefore(iframe, media.firstChild);
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(inject, { timeout: 2500 });
  } else {
    window.addEventListener("load", function () { setTimeout(inject, 200); });
  }
})();

/* Mobile nav ------------------------------------------------------------- */
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
})();

/* Language dropdown — keep aria-expanded honest (CSS opens on hover/focus) -- */
(function () {
  document.querySelectorAll(".lang-dropdown").forEach((dd) => {
    const trigger = dd.querySelector(".lang-dropdown__trigger");
    if (!trigger) return;
    const sync = (open) => trigger.setAttribute("aria-expanded", String(open));
    dd.addEventListener("mouseenter", () => sync(true));
    dd.addEventListener("mouseleave", () => { if (!dd.contains(document.activeElement)) sync(false); });
    dd.addEventListener("focusin", () => sync(true));
    // Defer so document.activeElement points at the new focus target.
    dd.addEventListener("focusout", () => setTimeout(() => {
      if (!dd.contains(document.activeElement)) sync(false);
    }, 0));
  });
})();

/* FAQ — single open accordion -------------------------------------------- */
(function () {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        items.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });
})();

/* Animate on scroll ------------------------------------------------------ */
(function () {
  const els = document.querySelectorAll("[data-aos], [data-aos-stagger]");
  if (!els.length) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  els.forEach((el) => {
    const delay = el.getAttribute("data-aos-delay");
    if (delay) el.style.setProperty("--aos-delay", delay + "ms");
  });

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  els.forEach((el) => io.observe(el));
})();

/* Active nav link on scroll ---------------------------------------------- */
(function () {
  const links = Array.from(document.querySelectorAll('.main-nav > a[href^="#"]'));
  const map = links
    .map((a) => ({ a, sec: document.getElementById(a.getAttribute("href").slice(1)) }))
    .filter((x) => x.sec);
  if (!map.length) return;

  let ticking = false;
  function update() {
    ticking = false;
    const line = window.innerHeight * 0.3;
    let active = null;
    let best = -Infinity;
    map.forEach((x) => {
      const top = x.sec.getBoundingClientRect().top;
      if (top <= line && top > best) { best = top; active = x.a; }
    });
    links.forEach((a) => a.classList.toggle("is-active", a === active));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

/* Logo -> scroll to top -------------------------------------------------- */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".logo, .footer-logo").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  });
})();

/* Services — image carousel per card ------------------------------------- */
(function () {
  document.querySelectorAll("[data-service-card]").forEach((card) => {
    const slides = Array.from(card.querySelectorAll("[data-service-slide]"));
    const prev = card.querySelector("[data-service-prev]");
    const next = card.querySelector("[data-service-next]");
    const meta = card.querySelector("[data-service-meta]");
    if (slides.length <= 1) return;

    let i = 0;
    function render() {
      slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
      if (meta) {
        meta.classList.add("is-updating");
        setTimeout(() => {
          meta.textContent = slides[i].getAttribute("data-meta") || "";
          requestAnimationFrame(() => meta.classList.remove("is-updating"));
        }, 180);
      }
    }
    prev && prev.addEventListener("click", () => { i = (i - 1 + slides.length) % slides.length; render(); });
    next && next.addEventListener("click", () => { i = (i + 1) % slides.length; render(); });
    render();
  });
})();

/* References — infinite marquee ------------------------------------------ */
(function () {
  document.querySelectorAll("[data-marquee]").forEach((m) => {
    const track = m.querySelector(".marquee__track");
    if (!track) return;
    const vp = m.querySelector(".marquee__viewport") || m;
    const prev = m.querySelector("[data-marquee-prev]");
    const next = m.querySelector("[data-marquee-next]");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 720px)");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const SPEED = 0.6;

    let paused = false;
    let inView = true;
    let raf = null;
    let offset = 0;
    function period() { return (track.scrollWidth + gap) / 2; }
    function render() { track.style.transform = "translateX(" + (-offset) + "px)"; }
    function advance(d) {
      const p = period();
      offset = (((offset + d) % p) + p) % p;
      render();
    }
    function step() {
      if (!paused && inView) advance(SPEED);
      raf = requestAnimationFrame(step);
    }
    const jump = () => Math.min(vp.clientWidth * 0.85, 480);
    // One card's worth of horizontal distance (for the mobile snap carousel)
    function cardStep() {
      const card = track.querySelector(".tcard:not([aria-hidden='true'])") || track.querySelector(".tcard");
      const g = parseFloat(getComputedStyle(track).columnGap) || gap;
      return card ? card.getBoundingClientRect().width + g : vp.clientWidth * 0.85;
    }
    function go(dir) {
      if (mobile.matches) {
        // Native scroll-snap takes over: nudge one card, the browser re-centres it.
        vp.scrollBy({ left: dir * cardStep(), behavior: reduce ? "auto" : "smooth" });
      } else {
        advance(dir * jump());
      }
    }
    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));
    m.addEventListener("mouseenter", () => { paused = true; });
    m.addEventListener("mouseleave", () => { paused = false; });

    function setMode() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (mobile.matches || reduce) {
        // Hand control to native horizontal scrolling / scroll-snap
        offset = 0;
        track.style.transform = "";
      } else {
        offset = 0; render();
        raf = requestAnimationFrame(step);
      }
    }
    setMode();
    mobile.addEventListener("change", setMode);

    // Stop the rAF loop entirely while the marquee is off-screen (saves CPU/battery).
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        if (mobile.matches || reduce) return;
        if (inView && !raf) { raf = requestAnimationFrame(step); }
        else if (!inView && raf) { cancelAnimationFrame(raf); raf = null; }
      }, { threshold: 0 }).observe(m);
    }
  });
})();

/* Process — highlight the step nearest the viewport centre ---------------- */
(function () {
  const list = document.querySelector(".process__list");
  if (!list) return;
  const steps = Array.from(list.querySelectorAll(".process__step"));
  if (!steps.length) return;

  let active = -1;
  let ticking = false;

  function update() {
    ticking = false;
    const focusY = window.innerHeight * 0.5;
    let best = 0;
    let bestDist = Infinity;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - focusY);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best === active) return;
    active = best;
    steps.forEach((step, i) => step.classList.toggle("process__step--active", i === best));
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();

/* Language preference cookie --------------------------------------------- */
(function () {
  const current = document.documentElement.lang || "cs";
  function setCookie(v) {
    document.cookie = "lang=" + v + ";path=/;max-age=31536000;samesite=lax";
  }
  function getCookie() {
    const m = document.cookie.match(/(?:^|;\s*)lang=(cs|en|de|sk|pl)\b/);
    return m ? m[1] : null;
  }
  document.querySelectorAll("[data-lang-switch]").forEach((el) => {
    el.addEventListener("click", () => setCookie(el.dataset.langSwitch));
  });
  const pref = getCookie();
  if (pref && pref !== current) {
    location.replace(pref === "cs" ? "/" : "/" + pref + "/");
  }
})();

/* Contact form → HubSpot Forms API v3 ------------------------------------ */
(function () {
  const form = document.querySelector('form[data-hs-form]');
  if (!form) return;

  const portal = form.dataset.hsPortal;
  const guid = form.dataset.hsFormGuid;
  if (!portal || !guid) return;

  const endpoint = "https://api.hsforms.com/submissions/v3/integration/submit/" + portal + "/" + guid;
  const status = form.querySelector("[data-hs-status]");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : "";

  const labels = {
    sending: form.dataset.hsSending || "Sending…",
    success: form.dataset.hsSuccess || "Thanks!",
    error: form.dataset.hsError || "Something went wrong.",
  };

  function setStatus(text, kind) {
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
    status.classList.remove("is-success", "is-error");
    if (kind) status.classList.add("is-" + kind);
  }
  function clearStatus() {
    if (!status) return;
    status.hidden = true;
    status.textContent = "";
    status.classList.remove("is-success", "is-error");
  }
  function getHutk() {
    const m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
    return m ? m[1] : undefined;
  }
  function consentText(form) {
    const span = form.querySelector(".contact-form__consent-text");
    return span ? span.textContent.replace(/\s+/g, " ").trim()
                : "I agree to allow HARDWARIO to store and process my personal data.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    // Manual validation for custom-select fields (native required was stripped
    // by the cselect wrapper since hidden + required breaks form submission).
    let firstInvalid = null;
    form.querySelectorAll(".cselect[data-required='true']").forEach((wrap) => {
      const sel = wrap.parentElement && wrap.parentElement.querySelector("select");
      const isEmpty = !sel || !sel.value;
      wrap.classList.toggle("is-invalid", isEmpty);
      if (isEmpty && !firstInvalid) firstInvalid = wrap.querySelector(".cselect__btn") || wrap;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus(labels.error, "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = labels.sending;
    }

    const fd = new FormData(form);
    const fields = [];
    for (const [name, value] of fd.entries()) {
      if (typeof value !== "string" || !value) continue;
      fields.push({ name, value });
    }

    const context = { pageUri: location.href, pageName: document.title };
    const hutk = getHutk();
    if (hutk) context.hutk = hutk;

    // Implicit consent: by submitting, the user agrees to the privacy notice
    // shown above the submit button. We mirror that text into HubSpot so the
    // consent record on the contact reflects what they actually saw.
    const body = {
      fields,
      context,
      legalConsentOptions: {
        consent: { consentToProcess: true, text: consentText(form) },
      },
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus(labels.success, "success");
        form.reset();
        // Reset the custom select visual to its placeholder
        const native = form.querySelector('select[name="service"]');
        const cselect = native && native.parentElement && native.parentElement.querySelector(".cselect");
        if (native && cselect) {
          const valEl = cselect.querySelector(".cselect__value");
          const ph = native.querySelector('option[value=""]');
          if (valEl && ph) { valEl.textContent = ph.textContent; cselect.classList.add("is-placeholder"); }
          cselect.querySelectorAll(".cselect__opt").forEach((li) => li.removeAttribute("aria-selected"));
        }
      } else {
        const detail = await res.text().catch(() => "");
        console.error("HubSpot form submission failed:", res.status, detail);
        setStatus(labels.error, "error");
      }
    } catch (err) {
      console.error("HubSpot form submission threw:", err);
      setStatus(labels.error, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
})();

/* Vlastní select (dropdown) – stejný jako v Academy ---------------------- */
(function () {
  let uid = 0;
  document.querySelectorAll(".contact-form select").forEach((native) => {
    const id = "cselect-" + uid++;
    const wrap = document.createElement("div");
    wrap.className = "cselect";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cselect__btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    const valEl = document.createElement("span");
    valEl.className = "cselect__value";
    btn.appendChild(valEl);
    btn.insertAdjacentHTML("beforeend",
      '<svg class="cselect__arrow" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1 1.5 5 5 5-5"/></svg>');

    const menu = document.createElement("ul");
    menu.className = "cselect__menu";
    menu.id = id + "-menu";
    menu.setAttribute("role", "listbox");
    btn.setAttribute("aria-controls", menu.id);

    let placeholder = "Vyberte…";
    const optionEls = [];
    Array.from(native.options).forEach((o, i) => {
      if (o.value === "") { placeholder = o.textContent; return; }
      const li = document.createElement("li");
      li.className = "cselect__opt";
      li.id = id + "-opt-" + i;
      li.setAttribute("role", "option");
      li.dataset.value = o.value;
      li.textContent = o.textContent;
      if (o.selected) li.setAttribute("aria-selected", "true");
      menu.appendChild(li);
      optionEls.push(li);
    });

    function syncLabel() {
      const sel = native.options[native.selectedIndex];
      if (!sel || sel.value === "") { valEl.textContent = placeholder; wrap.classList.add("is-placeholder"); }
      else { valEl.textContent = sel.textContent; wrap.classList.remove("is-placeholder"); }
    }
    syncLabel();

    wrap.append(btn, menu);
    native.after(wrap);
    native.hidden = true;
    native.setAttribute("tabindex", "-1");
    // Chrome refuses to submit a form with a `hidden + required` field that is
    // empty (and fails silently with no UI). Strip native required and let our
    // submit handler validate the value manually — the wrapper marks the field
    // as required so the handler still enforces it.
    if (native.required) {
      wrap.dataset.required = "true";
      native.removeAttribute("required");
    }

    let active = -1;
    function setActive(i) {
      active = Math.max(0, Math.min(optionEls.length - 1, i));
      optionEls.forEach((li, idx) => li.classList.toggle("is-active", idx === active));
      const el = optionEls[active];
      // aria-activedescendant belongs on the element with DOM focus (the button), not the list.
      if (el) { el.scrollIntoView({ block: "nearest" }); btn.setAttribute("aria-activedescendant", el.id); }
    }
    function open() {
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      const cur = optionEls.findIndex((li) => li.getAttribute("aria-selected") === "true");
      setActive(cur >= 0 ? cur : 0);
    }
    function close() { wrap.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.removeAttribute("aria-activedescendant"); }
    function choose(li) {
      native.value = li.dataset.value;
      optionEls.forEach((x) => x.removeAttribute("aria-selected"));
      li.setAttribute("aria-selected", "true");
      syncLabel();
      wrap.classList.remove("is-invalid");
      native.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      btn.focus();
    }

    btn.addEventListener("click", () => (wrap.classList.contains("is-open") ? close() : open()));
    menu.addEventListener("click", (e) => {
      const li = e.target.closest(".cselect__opt");
      if (li) choose(li);
    });
    btn.addEventListener("keydown", (e) => {
      const isOpen = wrap.classList.contains("is-open");
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
        e.preventDefault(); open(); return;
      }
      if (!isOpen) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Home") { e.preventDefault(); setActive(0); }
      else if (e.key === "End") { e.preventDefault(); setActive(optionEls.length - 1); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (optionEls[active]) choose(optionEls[active]); }
      else if (e.key === "Escape") { close(); }
    });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  });
})();
