# LabFlow

LabFlow is a laboratory workflow tracking MVP for medical laboratory interns and staff. It replaces manual logbook tracking with a traceable digital workflow from sample registration through processing, result production, dispatch handover and patient collection.

> **Important:** LabFlow is a workflow tracking tool only. It is **not** a diagnostic or clinical decision-support system. Do not store actual clinical results or unnecessary patient data in this prototype. All seed data is fictional.

## MVP features

- Email/password authentication with server-side sessions.
- Role-based access for interns, scientists, dispatch staff and administrators.
- Dashboard with live workload metrics and recent activity.
- Sample registration with automatically generated accession numbers.
- Centralised six-stage workflow with role-specific actions.
- Immutable workflow audit trail with note, actor and timestamp for every transition.
- Dispatch queue with acknowledgement, handover history and patient collection.
- Search by accession number, patient identifier or patient name.
- Filters for status, department and registration date.
- Admin user management: create accounts, set roles/departments, deactivate users, reset passwords.
- Profile and password settings.
- Responsive layout for desktop, tablet and mobile.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui-style components built on Radix UI |
| Icons | Lucide React |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Authentication | Auth.js (NextAuth v5) credentials provider |
| Validation | Zod |

## Prerequisites

- Node.js 20.9 or later
- npm 10 or later
- Docker Desktop (recommended), or an existing PostgreSQL 14+ database

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
#    Windows PowerShell:
Copy-Item .env.example .env
#    macOS/Linux:
#    cp .env.example .env

# 3. Generate an Auth.js secret and paste it into AUTH_SECRET in .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 4. Start PostgreSQL (Docker)
docker compose up -d

# 5. Generate the Prisma client and apply the included migration
npx prisma generate
npx prisma migrate deploy

# 6. Load fictional seed data
npm run db:seed

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with one of the demo accounts below.

If you do not use Docker, create a PostgreSQL database and set `DATABASE_URL` in `.env` to your connection string, then continue from step 5.

## Environment variables

Copy `.env.example` to `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `AUTH_SECRET` | Yes | Secret used to sign Auth.js sessions. Use a long random value. |
| `AUTH_TRUST_HOST` | Local/proxy | Set to `true` when running locally or behind a trusted proxy. |
| `NEXT_PUBLIC_APP_NAME` | No | Optional display name. Defaults to LabFlow. |

The default Docker Compose database is:

```text
postgresql://labflow:labflow@localhost:5432/labflow?schema=public
```

## Demo accounts

All seed accounts use the password **`Password123!`**.

| Role | Email | Default department |
| --- | --- | --- |
| Supervisor / Admin | `admin@labflow.test` | Haematology & Blood Transfusion |
| Laboratory Scientist | `scientist@labflow.test` | Clinical Chemistry |
| Laboratory Intern | `intern@labflow.test` | Haematology & Blood Transfusion |
| Dispatch Staff | `dispatch@labflow.test` | Unassigned |

Additional seed accounts: `scientist2@labflow.test`, `scientist3@labflow.test`, `intern2@labflow.test`, `dispatch2@labflow.test`.

The login page also has one-click demo account selectors.

## Workflow

```text
Registered
    ↓  (Intern, Scientist, Admin)
Processing
    ↓  (Scientist, Admin)
Result Produced
    ↓  (Intern, Scientist, Admin)
Awaiting Dispatch
    ↓  (Dispatch, Admin)          ← creates handover record
Received at Dispatch
    ↓  (Dispatch, Admin)
Collected                          ← closes the workflow
```

Every transition writes a `WorkflowEvent` containing:

- previous status
- new status
- staff member
- timestamp
- optional note

The dispatch handover record is created when dispatch acknowledges receipt. It stores the staff member who handed the result over, who received it, timestamps, and the staff member who recorded collection.

### Role permissions

| Action | Intern | Scientist | Dispatch | Admin |
| --- | :---: | :---: | :---: | :---: |
| View dashboard, samples and dispatch | ✓ | ✓ | ✓ | ✓ |
| Register a sample | ✓ | ✓ | – | ✓ |
| Start processing | ✓ | ✓ | – | ✓ |
| Mark result produced | – | ✓ | – | ✓ |
| Send result to dispatch | ✓ | ✓ | – | ✓ |
| Acknowledge receipt at dispatch | – | – | ✓ | ✓ |
| Record collection | – | – | ✓ | ✓ |
| Manage users | – | – | – | ✓ |

Permissions are defined once in [`lib/workflow.ts`](lib/workflow.ts). UI actions and server route handlers both use that definition, and every API mutation re-checks the current database role.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run db:generate` | Generate the Prisma client. |
| `npm run db:migrate` | Create/apply migrations in development. |
| `npm run db:deploy` | Apply committed migrations (production-safe). |
| `npm run db:seed` | Reset and load fictional seed data. |
| `npm run db:reset` | Drop the schema, re-run migrations and seed. |
| `npm run db:studio` | Open Prisma Studio. |

## Database setup and migrations

Schema: [`prisma/schema.prisma`](prisma/schema.prisma)  
Migration: [`prisma/migrations/20261108000000_init/migration.sql`](prisma/migrations/20261108000000_init/migration.sql)  
Seed: [`prisma/seed.ts`](prisma/seed.ts)

Common commands:

```bash
# Apply committed migrations
npx prisma migrate deploy

# Development: create a new migration after changing the schema
npx prisma migrate dev --name describe_your_change

# Regenerate the client
npx prisma generate

# Re-seed demo data (this deletes existing LabFlow data)
npm run db:seed
```

The seed script is intentionally destructive: it clears samples, workflow events, dispatch records, users and departments before inserting fictional demo data.

### Data model

- **User** — staff account, role, optional department, active flag.
- **Department** — laboratory department.
- **Sample** — accession number, patient reference, sample type, requested test, status, department and registering staff member.
- **WorkflowEvent** — immutable audit event for each status change.
- **DispatchRecord** — one-to-one handover record created on dispatch acknowledgement and completed on collection.

Foreign keys use `Restrict` on staff relationships and `Cascade` for workflow events and dispatch records tied to a sample. Indexes cover status, department, patient identifier, registration date and dispatch timestamps.

## Application structure

```text
app/
  (auth)/login/            Login page
  (app)/                   Protected application shell
    dashboard/             Metrics and recent activity
    samples/               Search, filters and pagination
    samples/new/           Sample registration
    samples/[id]/          Details, workflow actions and audit timeline
    dispatch/              Dispatch queue and handover history
    users/                 Admin-only user management
    settings/              Profile, password and app information
  api/                     Route handlers (samples, users, profile, health, auth)
components/
  ui/                      Reusable shadcn/ui-style primitives
  samples/                 Workflow, timeline, progress, filters, forms
  users/                   Admin user management UI
  settings/                Profile and password forms
  layout/                  Responsive sidebar shell
lib/
  data/                    Read-only database queries
  services/                Business logic and transactional writes
  workflow.ts              Central workflow definitions and permissions
  validations.ts           Zod request schemas
  auth.ts / api-auth.ts    Auth.js config and server-side API guards
prisma/                    Schema, migration and seed data
```

Layering is intentional: pages read through `lib/data`, mutations call `lib/services`, and route handlers handle authentication, validation and HTTP responses.

## API endpoints

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/samples` | Intern, Scientist, Admin |
| `PATCH` | `/api/samples/[id]/status` | Role depends on transition |
| `POST` | `/api/users` | Admin |
| `PATCH` | `/api/users/[id]` | Admin |
| `PATCH` | `/api/profile` | Signed-in user |
| `POST` | `/api/profile/password` | Signed-in user |
| `GET` | `/api/health` | Public health check (includes database connectivity) |
| `*` | `/api/auth/[...nextauth]` | Auth.js |

All mutation endpoints validate input with Zod, resolve the signed-in user from the session, re-check the user's current database role, and return JSON errors with appropriate HTTP status codes.

## Security notes

- Passwords are hashed with bcrypt (cost 12).
- Sessions are signed JWT cookies with an 8-hour lifetime.
- Protected pages redirect unauthenticated users to `/login`.
- Admin pages and API mutations enforce roles on the server, not only in the UI.
- Deactivated accounts cannot sign in, and API calls are re-checked against the database.
- Workflow events are append-only: there is no update or delete API for audit history.
- Patient names are optional, and the prototype does not store clinical test results.
- Seed data is fictional and intended only for development.

## Troubleshooting

**`P1001: Can't reach database server`**  
Make sure PostgreSQL is running (`docker compose ps`) and that `DATABASE_URL` points at the right host/port.

**`@prisma/client did not initialize yet`**  
Run `npx prisma generate`.

**Login redirects back to sign-in**  
Confirm `AUTH_SECRET` is set in `.env` and restart the server after changing environment variables.

**Port 5432 already in use**  
Stop the existing PostgreSQL service, or change the host port in `docker-compose.yml` and update `DATABASE_URL` accordingly.

**npm blocked Prisma/ESBuild install scripts**  
On npm versions that require script approval, run `npm install-scripts approve @prisma/client prisma @prisma/engines esbuild` and then `npm rebuild`.

**Need a clean demo database**  
Run `npm run db:reset` (destructive) or `npm run db:seed`.

## Out of scope

The MVP intentionally excludes AI diagnosis, automated result interpretation, billing, EMR integration, equipment integration, patient-facing apps, SMS/WhatsApp notifications and advanced analytics.

## Local URLs

- App: <http://localhost:3000>
- Health check: <http://localhost:3000/api/health>
- Prisma Studio: `npm run db:studio`
