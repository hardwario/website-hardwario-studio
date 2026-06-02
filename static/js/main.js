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
      if (!paused) advance(SPEED);
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
  });
})();

/* Language preference cookie --------------------------------------------- */
(function () {
  const current = document.documentElement.lang || "cs";
  function setCookie(v) {
    document.cookie = "lang=" + v + ";path=/;max-age=31536000;samesite=lax";
  }
  function getCookie() {
    const m = document.cookie.match(/(?:^|;\s*)lang=(cs|en)\b/);
    return m ? m[1] : null;
  }
  document.querySelectorAll("[data-lang-switch]").forEach((el) => {
    el.addEventListener("click", () => setCookie(el.dataset.langSwitch));
  });
  const pref = getCookie();
  if (pref && pref !== current) {
    location.replace(pref === "en" ? "/en/" : "/");
  }
})();
