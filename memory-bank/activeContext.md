# Active Context

[2026-04-01 14:16:00] - Final integration of expense management modules completed. All routes registered. Application running.

## Current Focus

*   Application fully integrated and running at http://localhost:3000
*   Swagger UI at http://localhost:3000/api/docs with all expense tags
*   Seed script available via `npm run seed`

## Recent Changes

*   `app.module.ts` — Added ServeStaticModule + ExpenseReportsModule + ExpensesModule + ExpenseAttachmentsModule
*   `main.ts` — Added ValidationPipe (transform+whitelist), uploads dir creation, updated Swagger title/tags
*   `backend/nest-cli.json` — **Created** to fix entryFile path (`backend/src/main`) since tsconfig rootDir is `..`
*   `backend/src/database/seeds/expense-management.seed.ts` — Created with 4 reports + 12 expenses
*   `backend/package.json` — Added `seed` script

## Open Questions/Issues

*   `nest start --watch` (Terminal 6 + Terminal 8 both running) — can stop Terminal 6 (old instance)
*   The `deleteOutDir: true` in nest-cli.json will clean dist on each build


This file tracks the project's current status, including recent changes, current goals, and open questions.
2026-03-31 14:12:07 - Memory Bank initialized.

*

## Current Focus

*   [2026-03-31 15:53:00] — Architecture fondation finalisée : toutes les décisions sont validées.
*   [2026-04-01 09:12:00] — **Architecture expense management planifiée** : document complet produit dans `memory-bank/expense-management-architecture.md`. Prêt pour implémentation en mode Code.

## Recent Changes

*   [2026-03-31 15:26:00] — Création de `ARCHITECTURE.md` : arborescence, plan d'implémentation, flux de données, stratégie de tests, structure Swagger/DTO, scripts npm, checklist de validation.
*   [2026-03-31 15:26:00] — Memory Bank initialisé avec le contexte du projet.
*   [2026-03-31 15:53:00] — Toutes les décisions validées (B1 à B5). `ARCHITECTURE.md` mis à jour avec les décisions finales. Aucun point bloquant restant.
*   [2026-04-01 09:12:00] — Production du plan d'architecture complet pour le module expense management : 3 entités, 3 enums, 16 fichiers à créer, API REST complète (15 routes), règles métier, configuration uploads multer, seeds, modifications existant.

## Open Questions/Issues

*   ✅ RÉSOLU — B1 : `sql.js` (WebAssembly SQLite, driver TypeORM `sqljs`) confirmé. `sqlite3` et `better-sqlite3` exclus.
*   ✅ RÉSOLU — B3 : Persistance fichier `data/db.sqlite` via `location` + `autoSave: true` (natif TypeORM sqljs).
*   ✅ RÉSOLU — B2 : CORS configurable via env var `CORS_ORIGIN` (défaut : `http://localhost:5173`).
*   ✅ RÉSOLU — B4 : Format `{ status, database, timestamp }` confirmé.
*   ✅ RÉSOLU — B5 : Un `.env` par package (`frontend/.env` + `backend/.env`).
*   ⚠️ NOTE — Driver `sqljs` incompatible avec TypeORM migrations CLI : `synchronize: true` gère le schéma. Migrations documentées dans l'architecture comme référence structurelle uniquement.
