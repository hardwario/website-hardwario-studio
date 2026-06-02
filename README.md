# HARDWARIO Studio — statický web (Zola)

Jednostránkový landing page pro **HARDWARIO Studio** (zakázkový 3D tisk, UV potisk,
testování, výroba a vývoj), postavený ve statickém generátoru
[Zola](https://www.getzola.org). Dvojjazyčný (CS/EN) se světlým i tmavým režimem.

## Spuštění

```bash
zola serve     # vývojový server s živým reloadem (http://127.0.0.1:1111)
zola build     # vygeneruje statický web do ./public
```

## Struktura

```
config.toml                  # konfigurace + překlady [translations] + kontakty [extra]
content/
  _index.md                  # VEŠKERÝ obsah landing page – čeština (data sekcí v [extra])
  _index.en.md               # tentýž obsah v angličtině
templates/
  base.html                  # <head>, načtení CSS, přepínač motivu, hlavička + patička
  index.html                 # pořadí sekcí landing page
  macros.html                # tlačítko + SVG ikony (sociální sítě, šipka, externí odkaz)
  partials/
    header.html              # navigace, přepínač jazyka a motivu, CTA
    footer.html              # patička (pobočky, navigace, odkazy)
    logo-full.html           # logo pro desktop
    logo-compact.html        # logo pro mobil
  sections/                  # jednotlivé sekce stránky (hero, steps, services, …)
static/
  css/
    base/                    # tokens, reset, typografie, layout, animace, responsive
    components/              # styly jednotlivých sekcí a UI prvků
    style.css                # přehled importů (pořadí načítání)
  js/main.js                 # motiv, mobilní menu, přepínač jazyka, AOS, slidery
  images/                    # fotky, loga, ikony
```

CSS je rozdělené na **base** (design tokeny, typografie, layout) a **components**
(jedna sekce = jeden soubor). Načítá se po souborech v `base.html` (s cachebustem);
`style.css` slouží jako přehled pořadí.

## Editace obsahu

Texty, služby, projekty, zakázky, reference atd. se needitují v HTML — jsou jako data
v `content/_index.md` (čeština) a `content/_index.en.md` (angličtina), v sekci
`[extra]`. Společné popisky (navigace, patička, formulář) jsou v `config.toml`
v `[translations]` / `[languages.en.translations]`. Stačí upravit hodnoty a `zola`
web přegeneruje.

> **Pozor na pořadí v TOML:** všechny jednoduché klíče (`hero_title`, `services_title`,
> `testimonials`, …) musí být **před** prvními tabulkami `[extra.about_us]`,
> `[[extra.step]]`, `[[extra.service]]` atd.

## Motiv a jazyk

- **Tmavý režim** používá sémantické tokeny v `css/base/tokens.css` a přepínač v hlavičce
  (volba se ukládá do `localStorage`). V dark módu je akcentní červená `#F43F5E`;
  v logu zůstává `#E30427` a mění se pouze šedý nápis na bílý.
- **CS/EN** běží přes Zola i18n: čeština na `/`, angličtina na `/en/`. Volba se pamatuje
  přes cookie.

## Co je potřeba doplnit

- **Reference** v sekci „Co říkají naši zákazníci" jsou **placeholder** (smyšlené citace,
  označené komentářem v `_index.md` / `_index.en.md`) — nahraďte skutečnými.
- **Texty projektů** vychází z reálných produktů HARDWARIO a.s. (CHESTER, CHESTER Clime) —
  potvrďte/upřesněte detaily.
- **Anglické texty** jsou překlad — projděte tón a formulace.
- **Kontaktní formulář** nemá backend (`action="#"`) — napojte na svůj endpoint.
- **Odkazy** `href="#"` (např. „Zjistit více" u zakázek) vedou zatím nikam.
- **`base_url`** v `config.toml` je placeholder (`https://studio.hardwario.com`).
