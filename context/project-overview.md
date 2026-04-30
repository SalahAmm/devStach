# 🗃️ DevStash — Project Overview

> **Store Smarter. Build Faster.**
> A centralized, AI-enhanced knowledge hub for developers — code snippets, prompts, commands, docs, and more in one searchable workspace.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Auth Flow](#auth-flow)
- [AI Feature Flow](#ai-feature-flow)
- [UI / UX Philosophy](#ui--ux-philosophy)
- [Monetization](#monetization)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [API Routes](#api-routes)
- [Roadmap](#roadmap)
- [Status](#status)

---

## Problem Statement

Developers scatter their essential resources across a dozen different tools:

| Where It Lives | What's Lost There |
|---|---|
| VS Code / Notion | Code snippets |
| ChatGPT / Claude threads | AI prompts & workflows |
| Project directories | Context files |
| Browser bookmarks | Useful links |
| Random folders | Docs & references |
| `.txt` files | CLI commands |
| GitHub Gists | Project templates |
| `~/.bash_history` | Terminal commands |

This fragmentation causes **context switching overhead**, **lost institutional knowledge**, and **inconsistent developer workflows**.

➡️ **DevStash solves this with ONE searchable, AI-powered hub for all your dev knowledge.**

---

## Target Users

| Persona | Core Needs |
|---|---|
| 🧑‍💻 **Everyday Developer** | Quick access to snippets, commands, reference links |
| 🤖 **AI-First Developer** | Store and optimize prompts, contexts, system messages |
| 🎓 **Content Creator / Educator** | Reusable code, course notes, lesson templates |
| 🏗️ **Full-Stack Builder** | Patterns, boilerplates, API references, project scaffolds |

---

## Core Features

### A) Item Types

Items are typed, enabling smart filtering, icons, and AI-specific handling.

**System Types (built-in for all users):**

| Icon | Type | Description |
|---|---|---|
| `</>` | **Snippet** | Code in any language with syntax highlighting |
| `🤖` | **Prompt** | AI prompts with model metadata |
| `📝` | **Note** | Markdown-rendered freeform notes |
| `$_` | **Command** | Terminal / CLI commands |
| `📎` | **File** | Uploaded files (images, PDFs, templates) |
| `🖼️` | **Image** | Image uploads with preview |
| `🔗` | **URL** | Bookmarked links with OG metadata |

> **Pro only:** Custom item types with custom icon + color.

---

### B) Collections

Group items into named collections — mixed types allowed.

```
📁 React Patterns
  ├── useLocalStorage hook    (Snippet)
  ├── Error boundary template (Snippet)
  └── Component architecture  (Note)

📁 AI Context Files
  ├── Project context.md      (File)
  ├── Code reviewer prompt    (Prompt)
  └── Summarizer system msg   (Prompt)

📁 Python Snippets
  ├── Pandas cheatsheet       (Note)
  └── FastAPI auth boilerplate (Snippet)
```

---

### C) Search

Full-text search powered by Postgres `tsvector` / `ILIKE` across:

- Item title
- Item content / description
- Tags
- Item type name
- Collection name

Filters: type, collection, date range, favorites, pinned.

---

### D) Authentication

- Email + Password (bcrypt hashed, stored in DB)
- GitHub OAuth via NextAuth v5

Session strategy: JWT (stateless, Vercel-friendly).

---

### E) Additional Features

| Feature | Detail |
|---|---|
| ⭐ Favorites & Pinned | Surface critical items instantly |
| 🕐 Recently Used | Auto-tracked last-accessed timestamp |
| 📥 Import | From `.json`, `.md`, `.txt`, clipboard |
| ✏️ Markdown Editor | Full markdown with live preview |
| 📤 Export | JSON dump or ZIP archive of all items |
| 🌙 Dark Mode | Default; system-preference toggle |
| 🔍 Syntax Highlighting | Via `shiki` or `prism-react-renderer` |
| 📋 One-Click Copy | Copy snippet/command to clipboard |

---

### F) AI Superpowers

> **Powered by `claude-sonnet-4-20250514` via Anthropic API**

| Feature | Description |
|---|---|
| 🏷️ Auto-tagging | Suggests relevant tags from item content |
| 📄 AI Summary | Generates a 1–2 sentence description |
| 🔍 Explain Code | Plain-English explanation of any snippet |
| ✨ Prompt Optimizer | Rewrites prompts for clarity and effectiveness |
| 🌐 URL Enrichment | Fetches OG title + summary from pasted URLs |

> AI features are **Pro-only**. Free users see a teaser with upgrade CTA.

---

## Data Model

> Prisma schema — PostgreSQL (Neon)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────
model User {
  id                   String       @id @default(cuid())
  email                String       @unique
  emailVerified        DateTime?
  password             String?      // null for OAuth users
  name                 String?
  image                String?
  isPro                Boolean      @default(false)
  stripeCustomerId     String?      @unique
  stripeSubscriptionId String?      @unique
  stripeCurrentPeriodEnd DateTime?

  items                Item[]
  itemTypes            ItemType[]
  collections          Collection[]
  tags                 Tag[]
  accounts             Account[]    // NextAuth OAuth accounts

  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  @@index([email])
}

// NextAuth adapter models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// ─────────────────────────────────────────
// ITEM TYPE (system + custom)
// ─────────────────────────────────────────
model ItemType {
  id       String  @id @default(cuid())
  name     String  // "snippet", "prompt", "note", etc.
  icon     String? // lucide icon name or emoji
  color    String? // hex color for badge
  isSystem Boolean @default(false)

  userId   String?
  user     User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items    Item[]

  @@unique([name, userId]) // system types have userId=null
  @@index([userId])
}

// ─────────────────────────────────────────
// ITEM
// ─────────────────────────────────────────
model Item {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  contentType String   // "text" | "file"
  content     String?  @db.Text // for text-based items
  language    String?  // programming language for snippets

  // File fields
  fileUrl     String?
  fileName    String?
  fileMimeType String?
  fileSize    Int?     // bytes

  // URL fields
  url         String?
  urlTitle    String?
  urlFavicon  String?

  // AI-generated metadata
  aiSummary   String?  @db.Text
  aiTags      String[] // cached auto-tag suggestions

  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  lastUsedAt  DateTime?

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  typeId      String
  type        ItemType @relation(fields: [typeId], references: [id])

  collectionId String?
  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)

  tags         ItemTag[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([collectionId])
  @@index([typeId])
  @@index([isFavorite])
  @@index([isPinned])
}

// ─────────────────────────────────────────
// COLLECTION
// ─────────────────────────────────────────
model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  icon        String?  // emoji or lucide icon name
  color       String?  // accent color for sidebar
  isFavorite  Boolean  @default(false)

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  items       Item[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([name, userId])
  @@index([userId])
}

// ─────────────────────────────────────────
// TAGS
// ─────────────────────────────────────────
model Tag {
  id     String    @id @default(cuid())
  name   String
  userId String
  user   User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  items  ItemTag[]

  @@unique([name, userId])
  @@index([userId])
}

model ItemTag {
  itemId String
  tagId  String

  item   Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

### Entity Relationship Overview

```
User
 ├── Account[]          (OAuth providers — NextAuth)
 ├── Item[]             (all saved items)
 ├── Collection[]       (groupings of items)
 ├── ItemType[]         (custom types — Pro)
 └── Tag[]              (user-scoped tags)

Item
 ├── belongs to User
 ├── belongs to ItemType
 ├── belongs to Collection? (optional)
 └── has many Tags via ItemTag (join table)
```

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) | React 19, RSC, Server Actions |
| **Language** | TypeScript (strict mode) | End-to-end type safety |
| **Database** | [Neon PostgreSQL](https://neon.tech) | Serverless Postgres, branching |
| **ORM** | [Prisma 6](https://prisma.io) | Type-safe queries, migrations |
| **Auth** | [NextAuth v5](https://authjs.dev) | Email + GitHub OAuth, JWT sessions |
| **CSS / UI** | [Tailwind v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) | Component library, design system |
| **File Storage** | [Cloudflare R2](https://cloudflare.com/products/r2/) | S3-compatible, no egress fees |
| **AI** | [Anthropic API](https://anthropic.com) (`claude-sonnet-4-20250514`) | Tagging, summaries, explain code |
| **Payments** | [Stripe](https://stripe.com) | Subscriptions + webhooks |
| **Syntax** | [Shiki](https://shiki.matsu.io) | 100+ language support |
| **Caching** | [Upstash Redis](https://upstash.com) | Rate limiting, AI result caching |
| **Deployment** | [Vercel](https://vercel.com) | Edge-optimized, preview deploys |
| **Monitoring** | [Sentry](https://sentry.io) | Error tracking, performance |
| **Email** | [Resend](https://resend.com) | Transactional email (magic links, receipts) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│           Next.js App (React 19, RSC, Turbopack)        │
└──────────────────────┬──────────────────────────────────┘
                       │ Server Actions / API Routes
┌──────────────────────▼──────────────────────────────────┐
│                    NEXT.JS SERVER                        │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐ │
│  │  Auth Layer  │  │ API Routes  │  │ Server Actions │ │
│  │  NextAuth v5 │  │ /api/*      │  │ (mutations)    │ │
│  └──────┬───────┘  └──────┬──────┘  └───────┬────────┘ │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
    ┌─────▼──────┐  ┌───────▼──────┐  ┌──────▼──────────┐
    │  Neon DB   │  │ Cloudflare   │  │  Anthropic API  │
    │ PostgreSQL │  │     R2       │  │  claude-sonnet  │
    │  (Prisma)  │  │ File Storage │  │  + Upstash      │
    └────────────┘  └──────────────┘  └─────────────────┘
          │
    ┌─────▼──────┐
    │   Stripe   │
    │  Webhooks  │
    └────────────┘
```

---

## Auth Flow

```
User visits /login
       │
       ├─── Email + Password ──► NextAuth Credentials Provider
       │                               │
       └─── GitHub OAuth ──────► NextAuth GitHub Provider
                                       │
                              Verify / Create User in DB
                                       │
                              Issue JWT Session (7 days)
                                       │
                              Set secure httpOnly cookie
                                       │
                              Redirect to /dashboard
```

**Key decisions:**
- JWT sessions (stateless) — no DB session table, works at edge
- Passwords hashed with `bcryptjs` (12 rounds)
- GitHub OAuth stores account in `Account` model for future unlinking

---

## AI Feature Flow

```
User triggers AI action (e.g., "Auto-tag this snippet")
       │
       ▼
Server Action: /app/actions/ai.ts
       │
       ├── Check: user.isPro === true?
       │         └─ No → return 403 "Pro feature"
       │
       ├── Check: Redis rate limit (10 AI calls / user / hour)
       │         └─ Exceeded → return 429
       │
       ▼
Anthropic API call (claude-sonnet-4-20250514)
  prompt: item.content + structured instruction
       │
       ▼
Parse structured response (JSON)
       │
       ├── Cache result in Redis (TTL: 1hr)
       │
       ▼
Save to DB: item.aiTags / item.aiSummary
       │
       ▼
Return to client → Optimistic UI update
```

---

## UI / UX Philosophy

**Design language:** Minimal, keyboard-first, developer-native. Inspired by Linear, Raycast, and Obsidian.

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  TopBar: Search · Notifications · User avatar            │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  SIDEBAR   │            MAIN WORKSPACE                  │
│  (240px)   │                                            │
│            │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  • All     │  │ Item │ │ Item │ │ Item │ │ Item │     │
│  • Pinned  │  └──────┘ └──────┘ └──────┘ └──────┘     │
│  • Favs    │                                            │
│            │  Grid (default) or List view               │
│  ──────    │                                            │
│  Types     │                                            │
│  ──────    │                                            │
│  Collections│                                           │
│  ──────    │                                            │
│  Tags      │                                            │
│            │                                            │
│  [+ New]   │                                            │
└────────────┴────────────────────────────────────────────┘
```

### Component Decisions

| Component | Library / Approach |
|---|---|
| Command palette | `cmdk` — `⌘K` global search |
| Code editor | `CodeMirror 6` or `Monaco` (lightweight) |
| Markdown editor | `@uiw/react-md-editor` |
| Syntax highlight | `Shiki` (server-side) |
| Drag & drop | `@dnd-kit/core` (collections reorder) |
| Toasts | `sonner` |
| Modals / Dialogs | `shadcn/ui Dialog` |
| Icons | `lucide-react` |
| Date formatting | `date-fns` |

### Responsive Behavior

- **Desktop (≥1024px):** Persistent sidebar + grid/list workspace
- **Tablet (768–1024px):** Collapsible sidebar (icon-only collapsed)
- **Mobile (<768px):** Bottom sheet drawer for sidebar, single column list

### ScreenShots 

 - Refer to the screenshots below as a base for the dashboard ui , it does't have to be exact. Use it as a Refrence :

  - @context/screenshots/dashboard-ui-main.png 
  - @context/screenshots/dashboard-ui-drawer.png


---

## Monetization

### Plans

| | Free | Pro |
|---|---|---|
| **Price** | $0 | $8 / mo · $72 / yr (25% off) |
| **Items** | 50 | Unlimited |
| **Collections** | 3 | Unlimited |
| **File uploads** | ❌ | ✅ (up to 50MB / file) |
| **Custom item types** | ❌ | ✅ |
| **AI features** | ❌ | ✅ |
| **Export (JSON/ZIP)** | ❌ | ✅ |
| **Syntax highlighting** | ✅ | ✅ |
| **Dark mode** | ✅ | ✅ |
| **GitHub OAuth** | ✅ | ✅ |

### Stripe Integration

```
Checkout → Stripe Hosted Page
       │
       ▼
Stripe Webhook → /api/webhooks/stripe
       │
  Events handled:
  ├── checkout.session.completed   → set isPro=true, store subscription ID
  ├── invoice.payment_succeeded    → extend stripeCurrentPeriodEnd
  ├── customer.subscription.deleted → set isPro=false
  └── customer.subscription.updated → sync plan changes
```

**Key fields on User model:**
```typescript
stripeCustomerId       // Stripe customer ID
stripeSubscriptionId   // Active subscription ID
stripeCurrentPeriodEnd // When current period ends (grace period checks)
isPro                  // Cached boolean for fast checks
```

---

## Folder Structure

```
devstash/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + topbar shell
│   │   ├── page.tsx              # All items view
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── billing/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── items/route.ts        # GET, POST
│   │   ├── items/[id]/route.ts   # GET, PATCH, DELETE
│   │   ├── collections/route.ts
│   │   ├── ai/route.ts           # AI feature endpoint
│   │   ├── upload/route.ts       # R2 presigned URL
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── actions/
│   │   ├── items.ts              # Server actions for item CRUD
│   │   ├── collections.ts
│   │   └── ai.ts                 # AI server actions
│   └── layout.tsx                # Root layout (fonts, providers)
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── items/
│   │   ├── item-card.tsx
│   │   ├── item-editor.tsx
│   │   ├── item-type-badge.tsx
│   │   └── item-grid.tsx
│   ├── collections/
│   │   └── collection-sidebar.tsx
│   ├── search/
│   │   └── command-palette.tsx
│   └── layout/
│       ├── sidebar.tsx
│       └── topbar.tsx
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── stripe.ts                 # Stripe client
│   ├── r2.ts                     # Cloudflare R2 client
│   ├── ai.ts                     # Anthropic client + helpers
│   ├── redis.ts                  # Upstash Redis client
│   └── utils.ts                  # cn(), formatDate(), etc.
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seed system item types
│
├── types/
│   └── index.ts                  # Shared TypeScript types
│
├── hooks/
│   ├── use-items.ts              # SWR / React Query hooks
│   └── use-command-palette.ts
│
└── middleware.ts                 # Auth protection, Pro gate
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...@neon.tech/devstash?sslmode=require

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Storage
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=devstash-uploads
CLOUDFLARE_R2_PUBLIC_URL=https://assets.devstash.app

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...

# Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=https://devstash.app
```

---

## API Routes

### Items

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/items` | ✅ | List items (filterable) |
| `POST` | `/api/items` | ✅ | Create item |
| `GET` | `/api/items/:id` | ✅ | Get single item |
| `PATCH` | `/api/items/:id` | ✅ | Update item |
| `DELETE` | `/api/items/:id` | ✅ | Delete item |

### Collections

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/collections` | ✅ | List collections |
| `POST` | `/api/collections` | ✅ | Create collection |
| `PATCH` | `/api/collections/:id` | ✅ | Update collection |
| `DELETE` | `/api/collections/:id` | ✅ | Delete collection |

### AI (Pro only)

| Method | Path | Auth | Pro | Description |
|---|---|---|---|---|
| `POST` | `/api/ai/tag` | ✅ | ✅ | Auto-tag item |
| `POST` | `/api/ai/summarize` | ✅ | ✅ | Generate summary |
| `POST` | `/api/ai/explain` | ✅ | ✅ | Explain code |
| `POST` | `/api/ai/optimize-prompt` | ✅ | ✅ | Optimize prompt |

### Other

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Get presigned R2 URL |
| `POST` | `/api/webhooks/stripe` | Stripe webhook handler |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth endpoints |

---

## Development Workflow

### Branch Naming (Course Structure)

```bash
# Setup
git switch -c lesson-01-project-setup
git switch -c lesson-02-database-schema
git switch -c lesson-03-auth

# Core features
git switch -c lesson-04-item-crud
git switch -c lesson-05-collections
git switch -c lesson-06-search
git switch -c lesson-07-file-uploads

# Pro features
git switch -c lesson-08-ai-features
git switch -c lesson-09-stripe-billing
git switch -c lesson-10-export-import

# Polish
git switch -c lesson-11-ui-polish
git switch -c lesson-12-deployment
```

### Prisma Workflow

```bash
# Create migration
npx prisma migrate dev --name add_ai_summary_to_item

# Push schema (no migration, dev only)
npx prisma db push

# Seed system item types
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Regenerate client
npx prisma generate
```

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Run DB migrations
npx prisma migrate dev

# Seed item types
npx prisma db seed

# Start dev server
pnpm dev
```

---

## Roadmap

### ✅ Phase 0 — Planning
- [x] Spec finalized
- [x] Schema designed
- [x] Stack decided

### 🔨 Phase 1 — MVP

- [ ] Project setup (Next.js, Prisma, Tailwind, shadcn)
- [ ] Database schema + migrations
- [ ] Authentication (email + GitHub)
- [ ] Item CRUD (snippet, note, prompt, URL, command)
- [ ] Collections (create, assign items, view)
- [ ] Tags (create, attach, filter)
- [ ] Full-text search
- [ ] Favorites + pinned
- [ ] Free tier limits enforcement
- [ ] Basic responsive UI

### 🚀 Phase 2 — Pro

- [ ] Stripe billing + upgrade flow
- [ ] File uploads (R2 integration)
- [ ] AI auto-tagging
- [ ] AI summarization
- [ ] Explain code
- [ ] Prompt optimizer
- [ ] Custom item types
- [ ] Export (JSON + ZIP)
- [ ] Import from files

### 🔮 Phase 3 — Growth

- [ ] Shared / public collections
- [ ] Team & Org plans
- [ ] VS Code extension
- [ ] Browser extension (save page → DevStash)
- [ ] REST API + CLI tool
- [ ] Webhook integrations (Notion, GitHub Gist sync)
- [ ] Advanced search (semantic / vector)

---

## Useful Links

| Resource | URL |
|---|---|
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://www.prisma.io/docs |
| NextAuth v5 Docs | https://authjs.dev |
| shadcn/ui | https://ui.shadcn.com |
| Neon Console | https://console.neon.tech |
| Cloudflare R2 | https://dash.cloudflare.com |
| Anthropic API | https://docs.anthropic.com |
| Stripe Dashboard | https://dashboard.stripe.com |
| Upstash Console | https://console.upstash.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Resend | https://resend.com |

---

## Status

> 🟡 **In Planning** — Environment setup & UI scaffolding ready to begin.

---

*DevStash — Store Smarter. Build Faster.*
