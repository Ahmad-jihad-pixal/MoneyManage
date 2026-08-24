# MoneyManage

A personal finance tracker: accounts, transactions, transfers, budgets, savings goals, and
categories, with a Vue 3 frontend and an Express + Prisma (MySQL/MariaDB) backend.

This document describes the app as it exists in this repo, how to run it, its data model and
API, and — since a lot of it was wired up and debugged in one pass — what's solid versus what's
still a stub.

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Vue 3 (`<script setup>`), Vite, Vue Router, Pinia, Tailwind CSS, shadcn-vue (reka-ui) component kit |
| Backend    | Node.js, Express 5, TypeScript entry point (`ts-node --esm`) |
| Database   | MySQL/MariaDB via Prisma ORM 7 (`@prisma/adapter-mariadb`) |
| Auth       | JWT (`jsonwebtoken`) + `bcrypt` password hashing |

## Project structure

```
MoneyManage/
├── package.json          # root — runs the backend ("npm run dev")
├── backend/
│   ├── index.ts          # Express app entry point, port 3000
│   ├── config/prisma.js  # Prisma client (MariaDB adapter)
│   ├── middleware/auth.js
│   ├── routes/           # one router file per resource
│   ├── utils/            # getSignedAmount, getGoalSavedAmount
│   └── prisma/
│       ├── schema.prisma
│       ├── seed.js       # default categories
│       └── migrations/
└── frontend/
    ├── package.json      # Vite dev server, port 5173
    └── src/
        ├── views/        # one per route (dashboard, account, transactions, ...)
        ├── components/   # forms, cards, tables; components/ui/* is the shadcn kit
        ├── stores/        # Pinia stores, one per resource, own the fetch/create calls
        └── router/index.js
```

## Running it locally

**Prerequisites:** Node.js, and a MySQL/MariaDB server running locally with a database named
`MoneyManageDB` (or update the connection strings below to match yours).

**1. Backend** — from the repo root:

```bash
npm install
npm run dev
```

This starts Express on `http://localhost:3000`. Configuration lives in `backend/.env`:

```
JWT_SECRET=...
DATABASE_URL="mysql://root:<password>@localhost:3306/MoneyManageDB"
```

Note the DB host/user/password are also hardcoded separately in `backend/config/prisma.js` and
`backend/test-db.js` (not read from `DATABASE_URL`) — keep those in sync if you change credentials.

Apply migrations and seed the four default categories (Food & Drinks, Bills & Utilities, Salary,
Freelance) the first time:

```bash
cd backend
npx prisma migrate deploy
node prisma/seed.js
```

**2. Frontend** — in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. The frontend has no `.env` / API base URL config — every store
calls `http://localhost:3000` directly (see **Known limitations** below).

## Data model

Defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

- **User** → owns Accounts, Categories (custom ones), Budgets, Goals, Subscriptions.
- **Account** — `balance` is an *opening balance* set once at creation. After that it only
  changes as a side effect of Transactions, Transfers, and GoalTransfers — never edited directly.
- **Category** — `type` is `INCOME` or `EXPENSE`. `userId: null` marks a system default category
  (shared, read-only, seeded by `seed.js`); a non-null `userId` marks a user-owned custom one.
  Supports one level of parent/child nesting.
- **Transaction** — belongs to an Account and a Category. Creating/editing/deleting one updates
  the Account's `balance` and, if the category is an EXPENSE with an active Budget, the matching
  `BudgetCycle.spentAmount` — all in a single `prisma.$transaction(...)`.
- **Transfer** — moves money between two of the user's own Accounts (decrements one, increments
  the other).
- **Budget** — a spending limit per category/period (`DAILY`/`WEEKLY`/`MONTHLY`/`YEARLY`).
  Each Budget owns a series of **BudgetCycle** rows (one `ACTIVE` cycle at a time) that actually
  track `spentAmount` for that period.
- **Goal** — a savings target. Its `savedAmount` is never stored — it's computed on read by
  summing the goal's **GoalTransfer** rows (`IN` adds, `OUT` subtracts). Moving money `IN`
  decrements the source Account's balance; `OUT` increments it back.
- **Subscription** — modeled in the schema (recurring billing, reminders) but has **no routes or
  UI** — schema-only for now.

Soft delete (`deletedAt`) is used for Account, Category, Transaction, Budget, and Goal; Transfer
and GoalTransfer are hard rows (no soft delete, since they're money-movement history).

## API reference

All routes except `/api/login` and `/api/register` require `Authorization: Bearer <token>`
(`backend/middleware/auth.js`), and every query is scoped to `req.user.id` — the JWT's `id`
claim. Route naming is inconsistent across resources: **`/api/accounts` is plural**; every other
resource (`category`, `transaction`, `transfer`, `budget`, `goal`) is **singular**.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/register` | `{ name, email, password }`, password ≥ 8 chars |
| POST | `/api/login` | `{ email, password }` → `{ token }` (7-day expiry) |
| GET | `/api/accounts` | list |
| GET | `/api/accounts/:id` | |
| POST | `/api/accounts` | `{ name, balance? }` — opening balance |
| PUT | `/api/accounts/:id` | `{ name }` — name only, balance is derived |
| DELETE | `/api/accounts/:id` | hard delete; 409 if it still has transactions/transfers (FK restrict) |
| GET | `/api/category` | includes both the user's own and default (`userId: null`) categories |
| GET / POST / PUT / DELETE | `/api/category[/:id]` | default categories can't be edited/deleted (403) |
| GET | `/api/transaction` | query filters: `accountId`, `categoryId`, `from`, `to` |
| GET / POST / PUT / DELETE | `/api/transaction[/:id]` | body: `{ categoryId, accountId, amount, date, note }` |
| GET / POST / PUT | `/api/transfer[/:id]` | body: `{ fromAccountId, toAccountId, amount, date }` (no DELETE route) |
| GET / POST / PUT / DELETE | `/api/budget[/:id]` | body: `{ categoryId, amount, period, startDate, autoReset }`; response includes the computed `activeCycle`, `spentAmount`, `remaining`, `progress`, `daysRemaining` |
| GET / POST / PUT / DELETE | `/api/goal[/:id]` | body: `{ name, targetAmount }`; list/detail responses include computed `savedAmount` and `progress`; delete is blocked while `savedAmount > 0` |
| POST | `/api/goal/:id/transfer` | body: `{ accountId, type: "IN"\|"OUT", amount, date, note }` |
| GET | `/api/goal/:id/goaltransfer` | history for one goal |

## Frontend routes

`/`, `/accounts`, `/transactions`, `/transfers`, `/goals`, `/budgets`, `/categories` are nested
children of `AppLayout.vue` (the sidebar/navbar shell — see `router/index.js`); `/login` and
`/signup` are top-level routes with no layout. There's no route guard: an unauthenticated user
can navigate straight to any app page (it just fails to fetch and renders empty rather than
redirecting to `/login`).

## What this pass fixed

The frontend and most of the backend were already scaffolded before this session; the following
were found and fixed while getting the app to actually run end-to-end:

**Backend**
- `POST/PUT` on transactions, transfers, and goal-transfers passed the raw `date` string straight
  to Prisma instead of `new Date(date)`. Prisma 7's stricter validation rejected anything that
  wasn't a full ISO-8601 datetime, so **every transaction, transfer, and goal transfer creation
  or update was failing with a 500**. Fixed in `routes/transaction.js`, `routes/transfer.js`,
  `routes/goal.js`.

**Frontend**
- `goalAddMoney.vue` / `goalWithdraw.vue` referenced an undefined `moveType` at the top of
  `<script setup>` — a `ReferenceError` that crashed the entire Goals page on load. Worse, both
  components set the *shared* `goalStore.moveType` field at **mount time**, so whichever of the
  two mounted last silently won — meaning "Add Money" could actually submit as a withdrawal.
  Fixed by destructuring `moveType` from `storeToRefs` and setting it inside each form's submit
  handler instead of at setup time.
- `accountEdit.vue`'s `<form>` wrapped both `DialogTrigger` *and* `DialogContent`. `DialogContent`
  teleports its contents to `<body>` (via `DialogPortal`), so the submit button ended up outside
  the `<form>` in the live DOM and clicking "Save changes" silently did nothing — no request ever
  fired. Restructured to match the working pattern used everywhere else in the app (`<form>`
  entirely inside `<DialogContent>`). Confirmed no other Dialog-based form has this issue.
  Account editing/deleting is now fully wired (`accountStore.updateAccount` / `deleteAccount`
  added, calling the existing `PUT`/`DELETE /api/accounts/:id`).
- `authStore.register()` called a nonexistent `clearFiled()` after a successful signup.
- `budgetStore.createBudget()` called `router.push(...)` without ever calling `useRouter()` —
  would throw after every successful budget creation.
- `frontend/src/router/index.js` imported `@/views/categories.vue` (lowercase) while the file is
  `Categories.vue`; `GoalItem.vue` imported `goalWithdraw.vue` but the file on disk was named
  `"goalWithdraw .vue"` (trailing space). Both only worked by accident on Windows' case-insensitive
  filesystem and would break on Linux/macOS or in git. Renamed the file and fixed the import.
- `goals.vue` wired `@edit`/`@delete` listeners on `GoalItem` to `openEditDialog`/`confirmDelete`,
  neither of which exists — clicking those buttons would throw. Removed the dead listeners (see
  **Known limitations** — goal editing/deleting isn't built yet).

Verified after the fixes: register, login, create/list accounts, edit an account name end-to-end
through the UI, create a transaction (balance + budget cycle update correctly), create a transfer,
create a budget, create a goal, and move money `IN`/`OUT` of a goal (progress recalculates
correctly) — all exercised directly against the running backend and, for the account edit flow,
through the actual rendered UI.

## Second pass: sidebar bug, category CRUD, visual redesign

- **Sidebar closing on every navigation.** Every view (`dashboard.vue`, `account.vue`,
  `transactions.vue`, ...) rendered its *own* `<SidebarProvider><AppSidebar/>...`. Since
  `SidebarProvider` owns the sidebar's open/closed state as local component state, navigating to
  another route unmounted and remounted the whole provider on every click — on mobile this reset
  the sidebar's Sheet to closed every time. Fixed by introducing `components/AppLayout.vue` (a
  single `SidebarProvider` wrapping a `<RouterView/>`) and nesting all app routes under it in
  `router/index.js`; every view now renders only its own content. `login`/`signup` stay outside
  the layout (no sidebar there).
- **Category rename/delete** — the feature category pages advertised ("your own categories can be
  renamed or removed") but never implemented. Added `categoryStore.updateCategory` /
  `deleteCategory`, a `categoryEdit.vue` dialog, and an Actions column in `categoryItem.vue` that
  only shows edit/delete for the user's own categories (default categories keep their existing
  403 protection and show a "Default" lock badge instead).
- **Goal edit/delete** — was previously an unwired stub (see prior pass's known limitations). Now
  fully wired: `goalStore.updateGoal`/`deleteGoal`, a `goalEdit.vue` dialog, delete calls the
  existing `DELETE /api/goal/:id` (blocked server-side while the goal still has savings, same as
  before).
- **Budget delete** — wired to the existing `DELETE /api/budget/:id`. (Budget *editing* still has
  no UI — see Known limitations.)
- **Transaction delete** — added `transactionStore.deleteTransaction`, wired into the table.
- **Visual pass** to match the app's own design mockups (grid layouts, monospace figures, `$`
  formatting, status badges): new `lib/format.js` (`formatMoney`), account cards now show an
  **Opening** balance line, a new `transactionFilters.vue` (Account/Category/From/To/Reset —
  backed by `fetchTransactions(filters)`, which now accepts `accountId`/`categoryId`/`from`/`to`
  and forwards them as query params to `GET /api/transaction`), and consistent bold page headers.
  Added `Account.openingBalance` to the schema (migration
  `20260821140000_add_account_opening_balance`) — separate from `Account.balance`, set once at
  creation and never mutated afterward, so the UI can show "current vs. opening" the way it always
  claimed to. Existing rows were backfilled to their balance at the time of migration.

## Third pass: negative-balance guards, toast alerts, dialog UX, goal history, dashboard

- **Balance can never go negative.** Added a floor check before committing the Prisma
  `$transaction` in three places: `transaction.js` (create/edit), `transfer.js` (create/edit —
  accumulates net balance deltas per account so it's correct even when the same account is
  touched by both sides of an edit), and `goal.js`'s `IN` transfers. All return a `400` with a
  clear message instead of letting an account go below `0`.
- **Category delete blocked while it has children.** `DELETE /api/category/:id` now checks for
  non-deleted subcategories first and returns `400 "Delete the subcategories first"`.
- **Alerts now use shadcn-vue**, not the browser's native `alert()`. Added the shadcn-vue Sonner
  toast (`components/ui/sonner`, wrapping the already-installed `vue-sonner`), mounted once in
  `App.vue`. Every store's error path calls `toast.error(...)`, and every successful
  create/update/delete calls `toast.success(...)`.
- **Every dialog form now closes itself, but only on success.** Store mutations (`createAccount`,
  `updateGoal`, etc.) return `true`/`false`; each dialog component does
  `const ok = await store.createX(); if (ok) open.value = false`. Submitting invalid data keeps
  the dialog open (with the error toast) so the user can fix it and retry, instead of it silently
  closing or silently doing nothing.
- **Goal "View history"** now actually works — `goalStore.fetchGoalHistory` (backed by the
  existing `GET /api/goal/:id/goaltransfer`) plus a new `goalHistory.vue` dialog listing every
  transfer into/out of that goal. This surfaced a subtler bug: `goals.vue` imported
  `@/components/GoalItem.vue` (capital G) while the file is `goalItem.vue`. Windows resolves that
  fine on disk, but Vite's dev-server module graph treats the two casings as separate cache
  entries — so every edit to the real file kept compiling correctly, while the browser kept
  executing a stale cached module reached via the capital-G path. Fixed the import casing and
  confirmed (via `grep`) it's the only remaining case mismatch anywhere in `src/`.
- **Dashboard (`/`) is built.** Account balance cards, a "Recent activity" table (latest 5
  transactions, "View all" → `/transactions`), and compact Budgets/Goals summary cards (with
  "Manage budgets" → `/budgets`), all reusing the existing stores. The transaction-creation dialog
  was extracted out of `transactionCreate.vue` into a standalone `transactionCreateDialog.vue`
  (accepts a `label` prop) so both the Transactions page and the dashboard's "Add transaction"
  button share the exact same form/validation instead of duplicating it.
- Goals/Budgets grids gained an `sm:grid-cols-2` breakpoint (previously jumped straight from 1
  column to 3 at `xl`, skipping a comfortable tablet layout) — matches the Accounts page's grid.

## Fourth pass: spacing/sizing review, category-budget guard, goal progress fix

A pass over every page at 390 / 820 / 1024 / 1280 / 1440px, limited to spacing and sizing
utilities at the usage sites (no shadcn primitives in `components/ui/` were modified):

- **Cards were much too tall.** Each one carried shadcn's default 24px header→content gap *plus*
  a redundant `pb-2`/`pb-3` on the header. A three-line account card was 175px. Stat cards now use
  `gap-2` (→151px); goal/budget/dashboard section cards use `gap-4`.
- **Goal action buttons were mismatched** (107px vs 95px) because each sat at natural width inside
  its grid cell — `w-full` makes both 126px.
- Categories: the two-tab Expense/Income bar stretched the full 960px (now capped at `max-w-sm`),
  and rows were uneven (39px without action buttons vs 52px with) — `h-13` on the actions cell
  makes every row 52px.
- Transactions filter bar: "Reset" occupied a full `1fr` column; switching to
  `lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]` widened the four fields from 172px to 199px.
- Page headers got `pb-2`; note `space-y-*` uses margin-top on siblings, so a `mb-*` here would
  have collapsed away and done nothing — the extra room has to come from padding.
- **Mobile: 48px of horizontal page overflow on the dashboard.** The Recent-activity table's
  intrinsic width forced its grid column wider than the viewport, because grid items default to
  `min-width: auto` — so the Table's own `overflow-auto` never engaged. `min-w-0` on the grid
  children fixes it.
- **Mobile: the page header row was cramped** (title, description and button crushed side by side,
  description wrapping to three lines) — now stacks below `sm` with a full-width CTA. Transfer
  rows were also tightened so the account names no longer wrap onto two lines.

Auth forms (login + signup):

- **Both forms silently swallowed every failure.** Each only acted `if (response.ok)`, so a wrong
  password, a duplicate email, or a too-short password produced *no feedback at all* — the form just
  sat there. Both now throw on a non-OK response and expose the reason via `loginError` /
  `registerError`.
- Added a **show/hide password** toggle (eye button inside the field) to both forms.
- Added **red inline errors above the relevant input**: required/format checks client-side, plus the
  password ≥ 8 rule on signup mirroring the backend. Errors that can't be tied to a field
  ("Invalid credentials" — deliberately vague server-side so attackers can't enumerate emails) render
  as a banner at the top of the form instead. `"Email already exists"` *is* field-attributable, so it
  is routed onto the email input.
- Native `required` was removed and `novalidate` added — otherwise the browser's own validation popup
  fires first and the custom messages never get a chance to render.
- Watch out: the auth routes are inconsistent about their error key. `login.js` returns `{ error }`,
  and `register.js` returns `{ message }` for its 400s but `{ error }` for its 500 — unlike every
  other route, which uses `{ message }`. The stores read `data.message || data.error` to cope.
  Worth normalizing server-side.

Functional fixes:

- **Deleted budgets came back after a refresh.** `DELETE /api/budget/:id` soft-deletes (sets
  `deletedAt`), but none of the budget read routes filtered on it — so the list vanished the card
  optimistically, then `GET /api/budget` handed every soft-deleted budget straight back on the next
  load. Added `deletedAt: null` to all four budget lookups (list, get-by-id, update, delete), so a
  deleted budget is now genuinely gone and can't be re-fetched, edited, or re-deleted.
  The same gap let a *deleted* budget keep absorbing spending: `transaction.js` looks up the budget
  for a category to update its cycle, and without the filter it would find and update a budget the
  user had already removed — invisibly, since it no longer renders. Filtered those four lookups too.
  (Deliberately **not** filtered: the `category.findFirst` calls in `transaction.js`. Those resolve
  the category of an *existing* transaction, and adding the filter there would return `null` for a
  soft-deleted category and crash `getSignedAmount(...)` when editing or deleting that transaction.)
- **Deleting a category now checks for a linked budget** (`DELETE /api/category/:id`), alongside
  the existing subcategory check, and returns `400 "Delete the budget linked to this category
  first"`. A budget's `spentAmount` is derived from its category's transactions, so leaving it
  pointing at a category the user can no longer see would strand it.
- **Deleted categories no longer break their old transactions.** Category deletion is a *soft*
  delete, so the transactions stay (intended — you don't lose spending history), but the category
  drops out of `GET /api/category`, which only lists live ones. The transaction table looked its
  category up in that list, so old rows rendered as **"Unknown"** — and worse, `isIncome()` failed
  the same way, so an income transaction whose category had been deleted rendered as a *negative*
  amount. Both now fall back to the category object the API already sends alongside each
  transaction, showing e.g. `Gym (deleted)` with the correct sign. No transaction data is touched,
  and no backend change was needed.
- **A newly created goal's progress bar was broken until a manual refresh.** `POST /api/goal`
  returns the bare goal row, but `savedAmount`/`progress` are computed server-side on *read* only.
  `createGoal` was pushing that raw response straight into the list, so `progress` was `undefined`
  → `Math.min(undefined, 100)` → `NaN` → `translateX(-NaN%)`. It now re-fetches after creating,
  matching what `updateGoal`/`moveGoalMoney` already did.

## Known limitations / not yet built

- **No API base URL config.** Every store hardcodes `http://localhost:3000`. Fine for local dev,
  but there's nothing to change for a deployed backend without editing every store file.
- **No route guards.** Visiting any page while logged out just renders empty instead of
  redirecting to `/login`.
- **Budget editing has no UI.** Delete is wired but there's no edit dialog, though
  `PUT /api/budget/:id` exists.
- **Transfer editing/deleting has no UI.** `PUT /api/transfer/:id` exists but there's no
  `DELETE /api/transfer/:id` route at all, so transfer rows have no actions.
- **`TransferItem.vue` is an empty, unused file** — `transfers.vue` renders the list inline
  instead.
- **Subscriptions** exist in the Prisma schema (recurring billing, reminders) but have no routes
  or frontend at all.
- No net worth summary card on the dashboard (intentionally excluded).
- Several backend error responses use `massage` instead of `message` (typo) — harmless since the
  frontend now reads `data.message` with a fallback, but worth cleaning up eventually.

## Auth flow

`authStore.js` stores the JWT in `sessionStorage` (cleared per-tab on close). `login()` POSTs to
`/api/login`, stores the token, and redirects to `/`. Every other store reads
`authStore.token` and sends it as `Authorization: Bearer <token>` on each request.
