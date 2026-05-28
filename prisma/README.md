Seeding and DB notes

- Run the project seeder (creates/truncates `User` and inserts sample profiles):

```bash
npm run seed
```

- Seeder used: `prisma/seed_sqlite.js` (uses `better-sqlite3` and the local SQLite file `prisma/dev.db`).

- Rationale: the project now uses a minimal, standalone SQLite seeder to avoid Prisma v7 runtime complexities when running a standalone Node script.

- If you need a Prisma-based seed later:
  - Reintroduce a seed that constructs `PrismaClient` inside the intended runtime, or provide a driver adapter / `accelerateUrl` per Prisma v7 requirements.
  - See Prisma driver adapters for options.

- Notes:
  - `prisma/seed_sqlite.js` is idempotent and resets the `User` table before inserting sample profiles.
  - The previous interim inspector `prisma/check_db.js` has been removed.
