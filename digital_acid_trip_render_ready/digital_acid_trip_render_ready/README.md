# Digital Acid Trip Planner — Render Ready

Tohle je **Render-ready** verze planneru.

Doporučený deploy je **Render Static Site**. Appka je čistě frontendová a v repo už máš hotový `render.yaml`, který používá `runtime: static`, `buildCommand` a `staticPublishPath: ./dist`.

## Co je uvnitř

- `dist/` — hotová statická appka
- `render.yaml` — doporučený Blueprint pro Render Static Site
- `render.webservice.yaml.example` — volitelná varianta, když to chceš provozovat jako Node Web Service
- `server.js` — jednoduchý statický server pro lokální preview nebo Web Service fallback
- `scripts/render-build.js` — jednoduchá build kontrola pro Render

## Nejrychlejší nasazení na Render

### Varianta A — doporučeno: Static Site

1. Nahraj projekt do GitHub / GitLab / Bitbucket repa.
2. Na Renderu dej **New → Static Site**.
3. Připoj repo.
4. Pokud nechceš klikat ručně, můžeš nasadit i přes **Blueprint** pomocí `render.yaml` v rootu repa.
5. Když bude Render chtít build údaje ručně, použij:
   - **Build Command:** `npm run build:static`
   - **Publish Directory:** `dist`
6. Deployni.

### Varianta B — Web Service fallback

Když z nějakého důvodu nechceš Static Site, můžeš to rozjet i jako Node Web Service.

Použij:
- **Build Command:** `npm install`
- **Start Command:** `npm start`

nebo si přejmenuj `render.webservice.yaml.example` na vlastní Blueprint.

## Lokální preview

### Node
```bash
npm start
```

App poběží na `http://localhost:10000` nebo na portu z proměnné `PORT`.

## Poznámka

V samotné appce je panel **Render Deploy Layer**, kde si můžeš:
- uložit deploy preset,
- zkopírovat si `render.yaml`,
- exportnout/importnout snapshot planneru,
- resetnout demo stav.
