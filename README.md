# MitroRun 2026

Landing page for MitroRun, the city run of Mitrovica, Kosovo.
4 October 2026, start and finish at Sheshi Adem Jashari.

Organised by **7ARTE** and the running club **MitRun**.
Built by [PAPINGU](https://papingu.com).

---

## Status

This is the **design reference**. The site that ships is the WordPress build:

| Repository | Role |
|---|---|
| [papingu-mitrorun-theme](https://github.com/granittemaj/papingu-mitrorun-theme) | Templates, design system, front-end behaviour |
| [papingu-mitrorun-plugin](https://github.com/granittemaj/papingu-mitrorun-plugin) | Content types, fields, consent, legal pages, newsletter |

This mockup is kept visually identical to the theme so it can be used to review
design changes without a WordPress install. `assets/css/style.css` and
`assets/js/main.js` are **copied verbatim** from the theme — if you change one,
copy it across. The only difference is that the theme reads its data from
WordPress, while here the same `window.MitroRun` object is written by hand at
the bottom of `index.html`.

Content is Albanian. The WordPress admin interface is English. The SQ / EN / SR
switcher has been removed for now; the theme stays translation-ready, so it can
come back with Polylang or WPML.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Static HTML | No build step, deploys anywhere, easy to hand over |
| Styles | One CSS file, custom properties | Design tokens live in `:root`, no framework weight |
| Scripts | Vanilla JS, no dependencies | ~10 KB, no bundler |
| Maps | [Leaflet](https://leafletjs.com) 1.9.4 + OpenStreetMap tiles via CARTO | Free, no API key for the prototype |
| Fonts | Archivo, self-hosted (SIL OFL 1.1) | No Google Fonts request, so no consent banner needed for fonts |
| Photography | Pexels, hot-linked | Placeholder only, see below |

Total page weight excluding photographs and map tiles: roughly 250 KB.

## Structure

```
.
├── index.html                  single page, all sections + runtime config
├── assets/
│   ├── css/style.css           design tokens + all styles (copy of the theme's main.css)
│   ├── js/main.js              nav, countdown, reveals, gallery, maps, pace tool (copy of the theme's main.js)
│   ├── fonts/                  Archivo woff2 subsets + licence
│   └── img/                    favicon, social preview
└── README.md
```

## Run locally

No build step. Serve it so the map tiles and Pexels images behave:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

### GitHub Pages
Settings → Pages → Source: `main`, folder `/ (root)`. Live in about a minute.

### Any host
Upload the folder. There is nothing to compile.

Set the real domain in `index.html`: the `canonical`, `og:url` and `og:image` tags
currently point at `https://mitrorun.com/`.

---

## Editing content

### Race dates, times, prices
Three places must stay in sync:

1. The green fact bar under the hero (`<div class="bar">`)
2. The three race cards (`section#garat`)
3. The `routes` object in the `window.MitroRun` block at the bottom of `index.html`

In WordPress all three come from one place, MitroRun → Races.

### Countdown and configuration
Everything the JavaScript needs sits in one block at the bottom of `index.html`:

```js
window.MitroRun = {
  showMap: false,
  raceDate: '2026-10-04T11:00:00+02:00',
  start: [42.8901, 20.8672],
  routes: { ... }
};
```

### The course map
`showMap` is **off**, matching the shipped default, because the route is not yet
approved by the municipality. The rest of the itinerary section — tabs, facts,
elevation profile and pace calculator — works exactly as before; only the map
panel is gone and the column collapses to a single measure.

Flip it to `true` to preview the map. In WordPress the same switch is
**MitroRun → Settings → Map**, and while it is off Leaflet is never requested at
all. The mockup still loads Leaflet either way, so the flag can be flipped
without editing the markup.

### Course routes
Routes are **indicative sketches**, not surveyed. They are plotted by hand from the
square at `42.8901 N, 20.8672 E`.

To replace them with the real course, swap the `pts` arrays:

```js
'10': { label:'10K Liqeni', dist:'10 km', time:'11:00', elev:'~20 m',
        price:'20 €', km:10,
        pts:[ [lat,lng], [lat,lng], ... ] }
```

Everything else recalculates itself: kilometre markers are placed by measuring real
haversine distance along the line, and the map refits its bounds per route. A GPX
export from Strava converts to this format in a few lines. In WordPress you upload
the GPX directly and this is done for you.

Remove the "Skicë" disclaimer in the map legend once the course is approved by the
municipality.

### Photography
Every photograph is a **placeholder hot-linked from Pexels**, chosen to match the
approved treatment (mono by default, colour on hover). None of it is Mitrovica.
It exists so the layout can be reviewed with real images rather than grey boxes.

The photographs live in the hero, the quote band, the three race cards, the
gallery, the Mitrovica plates, the programme section and the closing CTA.

Choose replacements with **strong contrast**, not ones that depend on colour —
they are desaturated until hover.

### Colours and type
All tokens are at the top of `assets/css/style.css`:

```css
--green:#25B34C;   /* single accent, sampled from the Torcida crest */
--black:#0A0B0A;
--white:#FFFFFF;
```

---

## Before launch

- [ ] Turn the course map back on once the route is approved
- [ ] Confirm the 5K start time. It is set to 11:30 here and in the WordPress seed
      data, not 11:00 as in the original brief, because two waves cannot leave one
      start line at the same minute
- [ ] Replace indicative routes with the official GPX
- [ ] Connect the registration buttons to RAVE (hosted redirect or embedded widget, to be confirmed)
- [ ] Add real partner logos, currently numbered placeholders
- [ ] Replace all Pexels photography with real Mitrovica images, with written model
      releases — this is a legal requirement, not a preference, and it applies
      especially to children in the 2K
- [ ] Set the real domain and re-check the Open Graph tags
- [ ] Decide on CARTO tiles vs a paid provider if race-weekend traffic is expected
- [ ] Add a cookie and privacy page if any analytics are introduced
- [ ] Register the Instagram and Facebook handles used in the footer

## Licence and credits

- Map data © OpenStreetMap contributors, tiles © CARTO
- Archivo typeface, SIL Open Font License 1.1, see `assets/fonts/LICENSE-Archivo.txt`
- Placeholder photography from Pexels, free licence, to be replaced
- Site code © 2026 MitroRun / PAPINGU
