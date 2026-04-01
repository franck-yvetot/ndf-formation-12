# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2026-03-31 14:12:07 - Memory Bank initialized.

*

## Coding Patterns

*   [2026-03-31 15:54:00] — TypeScript strict mode (`strict: true`) dans tous les packages via `tsconfig.base.json`
*   [2026-03-31 15:26:00] — Interfaces nommées `I<Name>` (ex: `IHealthResponse`), Types nommés `T<Name>`
*   [2026-03-31 15:26:00] — `async/await` obligatoire (pas de `.then().catch()`)
*   [2026-03-31 15:26:00] — Paramètres et retours de fonctions toujours typés explicitement
*   [2026-03-31 15:26:00] — Queries SQL via parameterized queries TypeORM (jamais d'interpolation directe)

## Architectural Patterns

*   [2026-03-31 15:54:00] — **Monorepo npm workspaces** : `/frontend`, `/backend`, `/shared` — packages autonomes avec dépendances explicites
*   [2026-03-31 15:54:00] — **NestJS modulaire** : chaque domaine technique = un Module (DatabaseModule, HealthModule). AppModule == racine d'assemblage uniquement
*   [2026-03-31 15:54:00] — **DTO décorés Swagger** : toute réponse API exposée est typée via un DTO avec `@ApiProperty`
*   [2026-03-31 15:54:00] — **Types partagés via `/shared`** : contrat unique entre frontend et backend, importé comme `@app/shared`
*   [2026-03-31 15:54:00] — **Variables d'environnement par package** : `frontend/.env` (préfixe `VITE_*`) et `backend/.env` (accès via `process.env`)
*   [2026-03-31 15:54:00] — **Route de santé universelle** : `GET /api/health` retourne `{ status, database, timestamp }`
*   [2026-03-31 15:54:00] — **Driver SQLite `sqljs`** : TypeORM configuré avec `type: 'sqljs'`, `location: 'data/db.sqlite'`, `autoSave: true` — persistance fichier native sans code custom
*   [2026-03-31 15:54:00] — **CORS via env var** : `CORS_ORIGIN` dans `backend/.env`, lu au bootstrap NestJS via `app.enableCors({ origin: process.env.CORS_ORIGIN })`

## Testing Patterns

*   [2026-03-31 15:26:00] — **Colocation des tests** : `.spec.ts` (backend) et `.test.tsx` (frontend) au même niveau que le fichier source
*   [2026-03-31 15:26:00] — **NestJS Testing Module** pour les tests de services et controllers backend (isolation via `TestingModule`)
*   [2026-03-31 15:26:00] — **React Testing Library** + `jest-dom` pour les tests de composants frontend
*   [2026-03-31 15:26:00] — **Mocks explicites** pour toutes les dépendances externes (TypeORM DataSource, fetch)
*   [2026-03-31 15:26:00] — **Exclusions couverture** : `main.ts`, `*.module.ts` — fichiers de câblage sans logique testable
*   [2026-03-31 15:26:00] — **Seuil 80%** lignes / branches / fonctions / statements — par package séparément

---

## Expense Management Patterns [2026-04-01]

*   [2026-04-01 09:12:00] — **Routes imbriquées NestJS** : contrôleur `@Controller('expense-reports/:reportId/expenses')` — full path dans le décorateur controller, pas de sous-modules routeurs
*   [2026-04-01 09:12:00] — **PartialType pour les DTOs de mise à jour** : `UpdateExpenseReportDto extends PartialType(CreateExpenseReportDto)` — pattern NestJS Mapped Types, cohérent et sans duplication
*   [2026-04-01 09:12:00] — **Guards métier en début de service** : vérification statuts interdits via `ForbiddenException` avant toute mutation — pas de guards NestJS séparés (logique trop couplée au contexte)
*   [2026-04-01 09:12:00] — **Recalcul automatique `totalAmount`** : méthode privée `recalculateReportTotal()` appelée après chaque mutation d'une expense — SUM SQL via QueryBuilder
*   [2026-04-01 09:12:00] — **Upload fichiers** : multer DiskStorage, fileFilter MIME + limite 50MB dans la config, double validation dans le service
*   [2026-04-01 09:12:00] — **Suppression fichiers physiques** : `fs.unlinkSync(storagePath)` puis `repo.delete(id)` — erreur `unlinkSync` loggée mais non bloquante
*   [2026-04-01 09:12:00] — **UUID v4 pour les noms de fichier** : `${uuidv4()}${ext}` — unicité garantie, pas de collision, pas de path traversal
*   [2026-04-01 09:12:00] — **Initialisation répertoires au démarrage** : `fs.mkdirSync(dir, { recursive: true })` en top-level de module ou `main.ts` — pattern identique à `DatabaseModule` pour `data/`
*   [2026-04-01 09:12:00] — **Pagination standardisée** : `{ data: T[], total, page, limit, totalPages }` — structure réutilisable pour tous les GET liste
*   [2026-04-01 09:12:00] — **Filtres QueryBuilder** : conditions `andWhere()` conditionnelles — filtre `expenseCategories` via sous-requête `EXISTS`
