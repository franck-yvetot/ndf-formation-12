# Decision Log

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
