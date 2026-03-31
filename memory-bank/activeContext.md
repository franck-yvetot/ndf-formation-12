# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2026-03-31 14:12:07 - Memory Bank initialized.

*

## Current Focus

*   [2026-03-31 15:53:00] — Architecture finalisée : toutes les décisions sont validées. Prête pour le passage en mode Code (génération du scaffolding Phase 1).

## Recent Changes

*   [2026-03-31 15:26:00] — Création de `ARCHITECTURE.md` : arborescence, plan d'implémentation, flux de données, stratégie de tests, structure Swagger/DTO, scripts npm, checklist de validation.
*   [2026-03-31 15:26:00] — Memory Bank initialisé avec le contexte du projet.
*   [2026-03-31 15:53:00] — Toutes les décisions validées (B1 à B5). `ARCHITECTURE.md` mis à jour avec les décisions finales. Aucun point bloquant restant.

## Open Questions/Issues

*   ✅ RÉSOLU — B1 : `sql.js` (WebAssembly SQLite, driver TypeORM `sqljs`) confirmé. `sqlite3` et `better-sqlite3` exclus.
*   ✅ RÉSOLU — B3 : Persistance fichier `data/db.sqlite` via `location` + `autoSave: true` (natif TypeORM sqljs).
*   ✅ RÉSOLU — B2 : CORS configurable via env var `CORS_ORIGIN` (défaut : `http://localhost:5173`).
*   ✅ RÉSOLU — B4 : Format `{ status, database, timestamp }` confirmé.
*   ✅ RÉSOLU — B5 : Un `.env` par package (`frontend/.env` + `backend/.env`).
