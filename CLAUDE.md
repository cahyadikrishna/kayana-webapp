# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm preview      # preview production build
pnpm check        # type-check (svelte-check + tsc)
pnpm check:watch  # type-check in watch mode
```

No test suite exists yet. Type-check is the primary correctness gate.

## Required Environment Variables

Create `.env` (not committed):

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
PUBLIC_ADMIN_WA_PHONE=   # WhatsApp number for admin contact
GOOGLE_API_KEY=          # Drive API key (server-only)
```

## Architecture

**SvelteKit 5 app** deployed on Vercel (Node 20 runtime via `adapter-vercel`). No SSG — all pages use SSR.

### Data flow

1. **Admin** creates a session at `/admin/create-session` — stores session name + Google Drive folder URL in Supabase (`sessions` table). Folder ID is extracted from the URL.
2. Admin shares `/select/[sessionId]` link with clients.
3. **Client** visits the link — server loads the session from Supabase, then fetches all images from the Drive folder via the Google Drive v3 API (`GOOGLE_API_KEY`, public folders only).
4. Client selects photos; selections are held in a Svelte store (`src/lib/stores/selections.ts`, Map-backed for O(1) ops).
5. On submit, `POST /api/selections` validates with Zod, verifies the session exists, and inserts a row into Supabase `selections` table (columns: `session_id`, `selected_files` JSONB).

### Thumbnail proxy

Drive `thumbnailLink` URLs (`lh3.googleusercontent.com`) require Google auth cookies in the browser. `GET /api/thumb?u=<encoded-url>` proxies them server-side. Only `lh3.googleusercontent.com` and `drive.google.com` hostnames are allowed (SSRF guard).

### Key files

| Path | Purpose |
|------|---------|
| `src/lib/server/db.ts` | Supabase client (anon key) |
| `src/lib/server/google-drive.ts` | Drive API calls + thumbnail URL builder |
| `src/lib/stores/selections.ts` | Client selection state |
| `src/lib/types/index.ts` | All shared TypeScript interfaces |
| `src/lib/utils/constants.ts` | Drive API constants, image MIME types |
| `src/routes/api/thumb/+server.ts` | Thumbnail proxy |
| `src/routes/api/selections/+server.ts` | Selection submission endpoint |
| `src/routes/admin/` | Admin dashboard + session creation |
| `src/routes/select/[sessionId]/` | Client photo-selection UI |

### UI

shadcn-svelte-style component library under `src/lib/components/ui/` (Badge, Button, Card, Dialog, Input, Progress — backed by bits-ui). Tailwind CSS + tailwind-variants for styling.
