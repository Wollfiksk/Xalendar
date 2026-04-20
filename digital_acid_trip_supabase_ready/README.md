# Digital Acid Trip Planner — Supabase Ready

Tohle je **Supabase-ready** verze planneru. Je připravená tak, aby šla:

1. **rychle nahrát jako statický web do public bucketu v Supabase Storage**, a zároveň
2. **volitelně připojit na Supabase databázi** pro cloud sync stavu planneru.

## Co uploadnout

Nahraj obsah složky `dist/` do **public bucketu** v Supabase Storage.

Uvnitř `dist/` je:
- `index.html`
- `styles.css`
- `app.js`
- `supabase-config.js`

## Nejrychlejší nasazení do Supabase

### Varianta A — jen statický upload, bez databáze

Tohle funguje hned a ukládá stav do `localStorage` v prohlížeči.

1. V Supabase Dashboard otevři **Storage**.
2. Vytvoř bucket, třeba `planner`.
3. Nastav bucket jako **public**.
4. Nahraj do něj obsah složky `dist/`.
5. Otevři URL ve tvaru:

```text
https://PROJECT_ID.supabase.co/storage/v1/object/public/planner/index.html
```

### Varianta B — statický upload + cloud sync

1. V Dashboardu otevři **SQL Editor**.
2. Spusť SQL ze souboru `database/20260420_acid_planner.sql`.
3. Nahraj `dist/` do public bucketu.
4. Otevři `dist/supabase-config.js` a doplň:
   - `url`
   - `key`
   - `workspace`
5. Nahraj upravený `supabase-config.js` znovu do bucketu.
6. Po otevření appky můžeš kliknout na **Připojit cloud**.

## Důležité k API klíčům

Do frontendu dávej pouze:
- **publishable key**, nebo
- legacy **anon key**

**Nikdy ne service_role ani secret key.**

## Poznámka k bezpečnosti

SQL v `database/20260420_acid_planner.sql` je udělané schválně jako **jednoduchý demo setup**, aby šel projekt zprovoznit bez backendu a bez auth flow.

To znamená, že politika je velmi otevřená a hodí se na:
- demo
- osobní test
- rychlé nasazení

Na produkci doporučuju:
- přidat Auth
- svázat data s `auth.uid()`
- zpřísnit RLS politiky

## Lokální preview

Stačí otevřít `dist/index.html` v browseru.

Když chceš lokální server:

### Python
```bash
python -m http.server 4173 -d dist
```

### Node
```bash
npx serve dist
```

## Struktura

```text
.
├── database/
│   └── 20260420_acid_planner.sql
├── dist/
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── supabase-config.js
├── package.json
└── README.md
```
