# Decision Log

[2026-04-01 14:16:00] - Integration finale expense management

## Decision

*   Did NOT modify `database.module.ts` — `autoLoadEntities: true` already handles entity discovery via `forFeature()`
*   Used **direct DataSource approach** for seed (not NestJS context bootstrap) since sqljs DataSource with `location` + `autoSave` works standalone
*   Created `backend/nest-cli.json` with `entryFile: "backend/src/main"` to fix NestJS CLI entry point mismatch caused by `tsconfig.json` `rootDir: ".."`
*   Used `process.cwd()` (not `__dirname`) for `ServeStaticModule.rootPath` for consistency with the dev/production path

## Rationale

*   `autoLoadEntities: true` in TypeOrmModule.forRoot means entities registered via `forFeature()` are auto-discovered — adding them to `forRoot` entities array would be redundant
*   Without `nest-cli.json`, `nest start --watch` defaults to `dist/main.js` but tsconfig outputs to `dist/backend/src/main.js` → old stale `dist/main.js` was being executed
*   `deleteOutDir: true` in `nest-cli.json` ensures clean builds prevent stale file issues

## Implementation Details

*   `nest-cli.json` → `entryFile: "backend/src/main"` (matches tsconfig rootDir: ".." output path)
*   Seed file: `backend/src/database/seeds/expense-management.seed.ts` — standalone script using DataSource
*   `npm run seed` → `ts-node src/database/seeds/expense-management.seed.ts`


This file records architectural and implementation decisions using a list format.
2026-03-31 14:12:07 - Memory Bank initialized.

*

## Decision

*   [2026-03-31 15:26:00] — **Monorepo géré par npm workspaces natifs** (pas de Turborepo, Nx, Lerna)
*   [2026-03-31 15:54:00] — **`sql.js`** (package npm, WebAssembly SQLite) retenu comme driver SQLite pour TypeORM. `sqlite3` et `better-sqlite3` **explicitement exclus et confirmés exclus** le 2026-03-31.
*   [2026-03-31 15:54:00] — **Persistance fichier `data/db.sqlite`** via options natives TypeORM `sqljs` : `location: 'data/db.sqlite'` + `autoSave: true`. Aucun code manuel (`fs.writeFileSync`) requis.
*   [2026-03-31 15:54:00] — **CORS configurable** via variable d'environnement `CORS_ORIGIN` dans `backend/.env`. Valeur par défaut recommandée : `http://localhost:5173`.
*   [2026-03-31 15:54:00] — **Format réponse `/health`** : `{ status: 'ok'|'error', database: 'ok'|'error', timestamp: string (ISO 8601) }`.
*   [2026-03-31 15:54:00] — **Un `.env` par package** : `frontend/.env` (variables `VITE_*`) + `backend/.env` (`process.env`). Pas de `.env` racine.
*   [2026-03-31 15:26:00] — **Préfixe global `/api`** pour toutes les routes backend NestJS
*   [2026-03-31 15:26:00] — **Swagger UI** exposé sur `/api/docs`
*   [2026-03-31 15:26:00] — **`main.ts` et `*.module.ts` exclus du calcul de couverture** Jest backend
*   [2026-03-31 15:26:00] — **`fetch` natif** (sans axios) pour les appels HTTP frontend à ce stade
*   [2026-03-31 15:26:00] — **Types partagés dans `/shared`** consommés comme workspace npm interne `@app/shared`

## Rationale

*   npm workspaces : standard natif, zéro dépendance supplémentaire, suffisant pour 3 packages
*   `sql.js` : seul driver SQLite TypeORM sans dépendance native compilée (`node-gyp`). Avantage CI/CD significatif. Validation explicite reçue le 2026-03-31.
*   `location` + `autoSave` : gestion de persistance native TypeORM sqljs, sans logique custom. Plus robuste qu'une sauvegarde manuelle.
*   CORS via `CORS_ORIGIN` : plus flexible qu'une valeur hardcodée, prêt pour plusieurs environnements
*   `.env` par package : séparation propre des contextes Vite (`VITE_*`) et NestJS (`process.env`)
*   Préfixe `/api` : convention NestJS recommandée, différencie clairement l'API des assets statiques
*   Swagger sur `/api/docs` : convention NestJS, facilement mémorisable
*   Exclusion `main.ts`/`*.module.ts` : fichiers de câblage sans logique testable, biais artificiel sur le ratio de couverture
*   `fetch` natif : zéro dépendance, suffisant pour un endpoint unique à ce stade
*   `/shared` workspace : évite la duplication de types entre frontend et backend, garantit un contrat unique

## Implementation Details

*   TypeORM DataSource : `type: 'sqljs'`, `location: 'data/db.sqlite'`, `autoSave: true`, `autoLoadEntities: true`, `synchronize: true` (dev uniquement)
*   `@app/shared` référencé dans `package.json` frontend et backend via `"@app/shared": "*"`
*   `tsconfig.base.json` racine avec `strict: true`, étendu par chaque package
*   Compromis `sql.js` documentés : runtime WebAssembly (légèrement plus lent que natif), comportement de persistance différent en browser vs Node.js (Node.js = filesystem via `location`)

---

*   [2026-04-01 09:12:00] — **Architecture modulaire 3 modules expense** : `ExpenseReportsModule`, `ExpensesModule`, `ExpenseAttachmentsModule` — chacun autonome avec entité, service, controller, DTOs propres. Pattern identique à `HealthModule`.
*   [2026-04-01 09:12:00] — **Upload fichiers via Multer DiskStorage** : stockage disque local `backend/uploads/`, nom de fichier = UUID v4 + extension originale, exposition via `ServeStaticModule` sur `/uploads`.
*   [2026-04-01 09:12:00] — **`synchronize: true` conservé** : le driver `sqljs` est incompatible avec `TypeORM CLI migrations`. Les tables sont créées automatiquement au démarrage. Les fichiers migrations documentés sont structurels uniquement.
*   [2026-04-01 09:12:00] — **Recalcul `totalAmount` côté service Expense** : à chaque mutation (create/update/delete) d'une expense, `ExpensesService` recalcule et met à jour `totalAmount` du rapport parent via `SUM(amount)`.
*   [2026-04-01 09:12:00] — **`class-validator` + `class-transformer`** ajoutés + `ValidationPipe({ transform: true, whitelist: true })` global dans `main.ts` — absent du projet de fondation initiale.
*   [2026-04-01 09:12:00] — **UUID v4 pour les noms de fichiers uploaded** — package `uuid` ajouté. Garantit l'unicité sans collision et évite les path traversal attacks.
*   [2026-04-01 09:12:00] — **`ExpenseReport.status` non modifiable via CRUD** — `UpdateExpenseReportDto` est `PartialType(CreateExpenseReportDto)` qui n'inclut pas `status`. La transition de statut passe uniquement par `/submit`.
*   [2026-04-01 09:12:00] — **Route `POST /expense-reports/:reportId/submit` dédiée** — plutôt que PATCH sur `status`, pour exprimer explicitement l'intention métier et déclencher la mise à jour en cascade des expenses.
