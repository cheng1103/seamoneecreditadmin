## SeaMoneeCredit Admin Panel

Next.js 16 dashboard for reviewing loan applications, editing site content, tracking analytics, and handling contact inbox items. The UI talks directly to the Express backend via REST endpoints secured with cookie-based admin auth.

---

### Requirements

- Node.js 18.18+ (recommend 20 LTS)
- npm 9+ (or pnpm/yarn if you update the scripts)

---

### Environment variables

Create `admin/.env.local` with the backend API base URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

The admin app sends `credentials: 'include'` with every request, so the backend must enable CORS + cookies for the admin origin/domain. Add any future public keys with the `NEXT_PUBLIC_` prefix so that Next.js can expose them to the browser bundle.

---

### Install dependencies

```bash
cd admin
npm install
```

---

### Development

```bash
npm run dev
```

- Starts the Next.js dev server on [http://localhost:3001](http://localhost:3001) if port 3000 is already used by the marketing site
- Routes are defined in `src/app` (login, dashboard, applications, analytics, content, WhatsApp logs, contacts, settings)
- API helpers live in `src/lib/api.ts` and automatically include cookies on every call

---

### Production build

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_API_URL` to the deployed backend URL before building. When deploying to Vercel, use `npm run build` as the build command and add the env vars in the project settings. Ensure the backend admin auth cookie domain matches the admin hostname.

---

### Linting

```bash
npm run lint
```

Runs the Next.js/TypeScript ESLint config. Fix warnings before opening a PR.

---

### Security notes

- Admin auth uses HTTP-only JWT cookies plus a CSRF token stored in the `smc_admin_csrf` cookie.
- The API helper (`src/lib/api.ts`) automatically attaches `X-CSRF-Token` for non-GET requests, so custom fetches should do the same if you bypass the helper.

---

### Lead deduplication

- The Applications table hides suspected duplicate leads (hashed phone/email/name match) by default; untick “Hide duplicate leads (phone/email/name match)” in the filter bar to review every submission.
- Exports or scripts can reach the same behavior via `/api/admin/applications?dedupe=false`.
- After deploying the hashing change, run `npm run backfill:hashes` inside `backend/` once per environment so historical records also gain phone/email/name hash fingerprints.

---

### Useful paths

- `src/app/(dashboard)/applications/**` – application list/detail views + WhatsApp notification history
- `src/app/(dashboard)/content/**` – blog/FAQ/testimonial/product CRUD
- `src/app/(dashboard)/analytics/**` – overview + drill-down stats (fetches `/admin/analytics/*`)
- `src/app/(dashboard)/contacts/**` – inbox UI for `/api/admin/contacts`
- `src/components/ui/**` – shared shadcn/ui wrapper components
- `src/types/index.ts` – TypeScript interfaces shared across pages/hooks

---

### Deployment notes

1. Deploy backend (Railway/Render/etc.) with HTTPS + cookie-based admin auth.
2. Deploy this admin app (Vercel or similar) and set `NEXT_PUBLIC_API_URL` to the backend `/api` base.
3. Configure the backend CORS whitelist to include the admin origin so cookies survive cross-site requests.
4. Seed at least one admin user in the backend database before inviting teammates.
