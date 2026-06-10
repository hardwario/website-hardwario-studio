# HARDWARIO Studio — static website (Zola)

A single-page landing page for **HARDWARIO Studio** (custom 3D printing, UV printing,
testing, manufacturing and development), built with the static site generator
[Zola](https://www.getzola.org). Multilingual (CS / EN / DE / SK / PL) with light and dark modes.

## Running

```bash
zola serve     # dev server with live reload (http://127.0.0.1:1111)
zola build     # generates the static site into ./public
```

## Structure

```
config.toml                  # configuration + translations [translations] + contacts [extra]
content/
  _index.md                  # ALL landing-page content — Czech (section data in [extra])
  _index.en.md               # the same content in English
templates/
  base.html                  # <head>, CSS loading, SEO/social meta, theme switch, header + footer
  index.html                 # landing-page section order
  macros.html                # button + SVG icons (social networks, arrow, external link)
  partials/
    header.html              # navigation, language + theme switch, CTA
    footer.html              # footer (branches, navigation, links)
    logo-full.html           # logo for desktop
    logo-compact.html        # logo for mobile
  sections/                  # individual page sections (hero, steps, services, …)
static/
  css/
    base/                    # tokens, reset, typography, layout, animations, responsive
    components/              # styles for individual sections and UI atoms
  js/main.js                 # theme, mobile menu, language switch, FAQ accordion, AOS, sliders
  images/                    # photos, logos, icons
```

CSS is split into **base** (design tokens, typography, layout) and **components**
(one section = one file). The load order lives in the `css_files` list in `base.html`,
which inlines every file into a single `<style>` block (no render-blocking CSS requests).

## Editing content

Texts, services, projects, contracts, testimonials etc. are not edited in HTML — they live
as data in `content/_index.md` (Czech) and `content/_index.en.md` (English), in the
`[extra]` section. Shared labels (navigation, footer, form) are in `config.toml` under
`[translations]` / `[languages.en.translations]`. Just edit the values and `zola`
regenerates the site.

> **Mind the order in TOML:** all simple keys (`hero_title`, `services_title`,
> `testimonials`, …) must come **before** the first tables `[extra.about_us]`,
> `[[extra.step]]`, `[[extra.service]]` etc.

## Theme and language

- **Dark mode** uses semantic tokens in `css/base/tokens.css` and a switch in the header
  (the choice is stored in `localStorage`). In dark mode the accent red is `#F43F5E`;
  the logo keeps `#E30427` and only the grey wordmark turns white.
- **Languages** run through Zola i18n: Czech at `/`, the others at `/en/`, `/de/`,
  `/sk/`, `/pl/`. The choice is remembered via a cookie. UI strings live in
  `config.toml` (`[languages.<lang>.translations]`); page content lives in
  `content/_index.<lang>.md`.

## Contact form

The form posts to **HubSpot Forms API v3** (configured via `data-hs-*` attributes in
`templates/sections/contact.html`, handled in `static/js/main.js`). GDPR consent is
implicit — a notice below the Send button states that submitting the form constitutes
agreement, with a link to the privacy policy. That consent text is mirrored into HubSpot
via `legalConsentOptions` on submit.

## SEO / social

`templates/base.html` outputs the page title and description, a canonical URL,
`hreflang` alternates (CS/EN), and Open Graph + Twitter card tags. The shared social
preview image is `static/images/big-3D-1.jpg` — replace it with a dedicated 1200×630
image if you want a tailored share card.

## To be completed

- **Testimonials** in the "What our customers say" section are **placeholders** (fictional
  quotes, marked with a comment in `_index.md` / `_index.en.md`) — replace with real ones.
- **Project texts** are based on real HARDWARIO a.s. products (CHESTER, CHESTER Clime) —
  confirm/refine the details.
- **FAQ** texts (pricing, lead times, NDA…) should be verified with sales/production.
- **English copy** is a translation — review the tone and wording.
- **`base_url`** in `config.toml` is `https://studio.hardwario.com` — update if it changes.
