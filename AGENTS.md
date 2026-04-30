# DevStach

a Developer Knowledge hub for snippets , commands , prompts , notes, files , images ,links , custom types..

## Context Files 

Read the follwing to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Tech stack

- Next.js 16.2.4 (App Router)
- React 19.2.4
- Tailwind CSS v4 (uses `@tailwindcss/postcss`, not the v3 plugin)
- TypeScript 5 (strict mode)
- ESLint 9 (flat config in `eslint.config.mjs`)

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Key conventions

- **Path alias**: `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- **App Router**: All routes live in `src/app/`; no `pages/` directory
- **Tailwind v4**: No `tailwind.config.js` — styles are configured via `@tailwindcss/postcss` in `postcss.config.mjs`
- **No typecheck script**: There is no `tsc --noEmit` in `package.json`; lint and build handle type checking
- **No test framework**: This project has no test setup

## Architecture

- `src/app/layout.tsx` — Root layout (includes Geist fonts from `next/font/google`)
- `src/app/page.tsx` — Home route (`/`)
- `src/app/globals.css` — Global styles (Tailwind directives)
- `next.config.ts` — Next.js config