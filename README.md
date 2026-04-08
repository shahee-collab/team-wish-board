# Team Wish Board

A reusable wish board your team can deploy for **any occasion** — farewells, birthdays, anniversaries, or anything else. Teammates post wishes on a masonry-style wall with cards, illustrations, images, GIFs, and reactions.

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/team-wish-board.git
cd team-wish-board

# 2. Install dependencies
npm install

# 3. Run the setup wizard
npm run setup
```

The setup wizard walks you through:

| Prompt | What it sets |
|--------|-------------|
| Person's name | The person being celebrated |
| Team name | Shown in the header |
| Occasion type | `farewell` / `birthday` / `anniversary` / `custom` |
| Occasion date | ISO 8601 — the board locks after this date |
| Theme | `light` (Atlassian Design System) or `dark` (starfield + violet accents) |
| GIPHY API key | Enables the GIF search tab (optional) |
| Database URL | Neon Postgres connection string |
| Blob token | Vercel Blob for image uploads |

It generates a `.env.local` with all your settings.

## Features

- **Wish wall** — 3-column masonry grid with coloured cards, illustrations, uploaded images, or GIFs
- **Send wishes modal** — pick a card colour, choose an illustration, upload an image, or search GIFs
- **Edit & delete** — authors can edit or delete their wishes until the occasion date
- **Reactions** — toggle reactions with burst animation and live count
- **Celebration confetti** — fires after every new wish; full-screen on the occasion day
- **Light & dark themes** — Atlassian Design System light mode, or a dark mode with starfield background
- **3D card tilt** — cards tilt on hover following the mouse
- **Fully responsive** — mobile-first, works on all screen sizes
- **Reduced-motion safe** — all animations respect `prefers-reduced-motion`

## Occasion Types

The board adapts its title, metadata, and placeholder text based on the occasion:

| Type | Auto-generated title |
|------|---------------------|
| `farewell` | "The {Name} Effect" |
| `birthday` | "Happy Birthday, {Name}!" |
| `anniversary` | "Celebrating {Name}!" |
| `custom` | "Wishes for {Name}" |

You can override the title with `NEXT_PUBLIC_BOARD_TITLE` in `.env.local`.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + ADS tokens |
| Animations | Framer Motion |
| Confetti | canvas-confetti |
| GIF search | Giphy API (server-side proxy) |
| Database | Neon Postgres |
| Images | Next.js Image + Vercel Blob |

## Backend Setup

### Database (Neon Postgres)

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the **pooled (serverless)** connection string
3. Add it to `.env.local` as `DATABASE_URL`
4. Run the table creation SQL once in Neon's SQL Editor:

```sql
-- scripts/init-wishes-table.sql
CREATE TABLE IF NOT EXISTS wishes (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  message       TEXT NOT NULL,
  image         TEXT,
  card_color    TEXT,
  illustration  TEXT,
  timestamp     BIGINT NOT NULL,
  reactions     INTEGER NOT NULL DEFAULT 0,
  reaction_breakdown JSONB
);
```

### GIPHY (optional)

1. Create a free app at [developers.giphy.com](https://developers.giphy.com/)
2. Copy the API key
3. Add it to `.env.local` as `GIPHY_API_KEY`

Without a GIPHY key, the GIF tab shows a helpful "not configured" message instead of erroring.

### Vercel Blob (image uploads)

When deploying to Vercel, go to **Storage → Add → Blob** in the project dashboard. Vercel automatically injects `BLOB_READ_WRITE_TOKEN`. For local dev, copy the token from the Vercel dashboard into `.env.local`.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. In the project, open **Storage** and add **Blob**
4. In **Settings → Environment Variables**, add:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_PERSON_NAME`
   - `NEXT_PUBLIC_TEAM_NAME`
   - `NEXT_PUBLIC_OCCASION_DATE`
   - `NEXT_PUBLIC_OCCASION_TYPE`
   - `NEXT_PUBLIC_UI_VARIANT` (optional)
   - `GIPHY_API_KEY` (optional)
5. Deploy — each push triggers a new deployment

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PERSON_NAME` | Yes | Name of the person being celebrated |
| `NEXT_PUBLIC_TEAM_NAME` | Yes | Team name shown in the header |
| `NEXT_PUBLIC_OCCASION_DATE` | Yes | ISO 8601 date — board locks after this |
| `NEXT_PUBLIC_OCCASION_TYPE` | No | `farewell` (default) / `birthday` / `anniversary` / `custom` |
| `NEXT_PUBLIC_UI_VARIANT` | No | `dark` for dark mode; omit for light |
| `NEXT_PUBLIC_BOARD_TITLE` | No | Override auto-generated board title |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob token |
| `GIPHY_API_KEY` | No | Enables GIF search tab |

## Customising

### Illustrations

Six illustrations live in `public/illustrations/`. To swap them:

1. Replace the PNG files (recommended: 300x300 px, transparent background)
2. Update the `ILLUSTRATIONS` array in `components/WishCardBuilder.tsx`
3. Update the `ILLUSTRATION_MAP` in `components/WishCard.tsx`

### Card Colours

Edit the `CARD_COLORS` array in `components/WishCardBuilder.tsx`.

### Confetti Colours

Edit the colour arrays in `lib/celebration.ts`.

### Dark Theme Palette

All dark-mode CSS variables are in `app/globals.css` under the `html[data-ui="dark"]` block. Adjust the `--dark-*` custom properties to change the palette.

## Project Structure

```
├── app/
│   ├── layout.tsx                  # Root layout, theme injection
│   ├── page.tsx                    # Wish wall + occasion-day confetti
│   ├── globals.css                 # Global styles, light + dark themes
│   └── api/
│       ├── wishes/route.ts         # GET all, POST new wish
│       ├── wishes/[id]/route.ts    # PATCH edit, DELETE wish
│       ├── reactions/route.ts      # POST / DELETE reaction
│       ├── gifs/route.ts           # Giphy proxy (search + trending)
│       ├── upload/route.ts         # Image upload → Vercel Blob
│       └── image/route.ts          # Private blob image proxy
├── components/                     # All UI components
├── lib/
│   ├── occasion.ts                 # Occasion type system + content helpers
│   ├── site.ts                     # Site-level defaults from env vars
│   ├── ui.ts                       # Theme detection (light/dark)
│   ├── types.ts                    # Wish + WishesData interfaces
│   ├── wishes.ts                   # Server-side DB operations
│   ├── celebration.ts              # canvas-confetti helpers
│   └── image.ts                    # Image URL resolver
├── scripts/
│   ├── setup.mjs                   # Interactive setup wizard
│   ├── init-wishes-table.sql       # DB table creation
│   └── seed-test-data.js           # Sample data seeder
└── public/
    └── illustrations/              # Card illustration PNGs
```

## License

MIT
