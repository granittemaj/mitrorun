# MitroRun 2026

Landing page for MitroRun, the city run of Mitrovica, Kosovo.
4 October 2026, start and finish at Sheshi Adem Jashari.

Organised by **7ARTE** and the running club **MitRun**.
Built by [PAPINGU](https://papingu.com).

---

## Status

Static prototype, first review round. Content is Albanian only.
English and Serbian are planned but not built.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Static HTML | No build step, deploys anywhere, easy to hand over |
| Styles | One CSS file, custom properties | Design tokens live in `:root`, no framework weight |
| Scripts | Vanilla JS, no dependencies | ~9 KB, no bundler |
| Maps | [Leaflet](https://leafletjs.com) 1.9.4 + OpenStreetMap tiles via CARTO | Free, no API key for the prototype |
| Fonts | Archivo, self-hosted (SIL OFL 1.1) | No Google Fonts request, so no consent banner needed for fonts |

Total page weight excluding map tiles: roughly 250 KB.

## Structure

```
.
├── index.html                  single page, all sections
├── assets/
│   ├── css/style.css           design tokens + all styles
│   ├── js/main.js              nav, countdown, reveals, maps, pace tool
│   ├── fonts/                  Archivo woff2 subsets + licence
│   └── img/                    favicon, social preview
└── README.md
```

## Run locally

No build step. Open `index.html`, or serve it so the map tiles behave:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy

### GitHub Pages
Settings → Pages → Source: `main`, folder `/ (root)`. Live in about a minute.

### Any host
Upload the folder. There is nothing to compile.

Set the real domain in `index.html`: the `canonical`, `og:url` and `og:image` tags currently point at `https://mitrorun.com/`.

---

## Editing content

### Race dates, times, prices
Three places must stay in sync until this moves to WordPress:

1. The green fact bar under the hero (`<div class="bar">` in `index.html`)
2. The three race cards (`section#garat`)
3. The `ROUTES` object in `assets/js/main.js`

### Countdown
`assets/js/main.js`:

```js
var T = new Date('2026-10-04T11:00:00+02:00').getTime();
```

### Course routes
Routes are **indicative sketches**, not surveyed. They are plotted by hand from the square at `42.8901 N, 20.8672 E`.

To replace them with the real course, swap the `pts` arrays in `ROUTES`:

```js
'10': { label:'10K Liqeni', dist:'10 km', time:'11:00', elev:'~20 m',
        price:'20 €', km:10,
        pts:[ [lat,lng], [lat,lng], ... ] }
```

Everything else recalculates itself: kilometre markers are placed by measuring real haversine distance along the line, and the map refits its bounds per route. A GPX export from Strava converts to this format in a few lines.

Remove the "Skicë" disclaimer in the map legend once the course is approved by the municipality.

### Colours and type
All tokens are at the top of `assets/css/style.css`:

```css
--green:#25B34C;   /* single accent, sampled from the Torcida crest */
--black:#0A0B0A;
--white:#FFFFFF;
```

---

## Before launch

- [ ] Confirm the 5K start time. 10K and 5K are both listed at 11:00, which does not work from one start line
- [ ] Replace indicative routes with the official GPX
- [ ] Connect the registration buttons to RAVE (hosted redirect or embedded widget, to be confirmed)
- [ ] Add real partner logos, currently numbered placeholders
- [ ] Add photography for the Mitrovica section, currently line illustrations
- [ ] Set the real domain and re-check the Open Graph tags
- [ ] Decide on CARTO tiles vs a paid provider if race-weekend traffic is expected
- [ ] Add a cookie and privacy page if any analytics are introduced
- [ ] Register the Instagram and Facebook handles used in the footer

## Licence and credits

- Map data © OpenStreetMap contributors, tiles © CARTO
- Archivo typeface, SIL Open Font License 1.1, see `assets/fonts/LICENSE-Archivo.txt`
- Site code © 2026 MitroRun / PAPINGU
