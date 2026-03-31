# Architecture — Full-Stack Monorepo Foundation

> **Status:** ✅ Toutes les décisions validées — prête pour la génération de code.
> **Date:** 2026-03-31
> **Scope:** Generic technical foundation only. No business logic, no product features.

---

## 1. Hypothèses explicites

Les hypothèses suivantes sont formulées sur la base des contraintes reçues. Aucune n'est inventée : elles découlent directement des instructions. Si l'une d'elles est incorrecte, merci de le signaler avant la génération du code.

| # | Hypothèse | Source |
|---|-----------|--------|
| H1 | Le monorepo est géré via **npm workspaces** natifs (pas de Turborepo, Nx, Lerna, etc.) | Contrainte explicite |
| H2 | Le frontend est bootstrappé avec **Vite** (pas CRA) | Contrainte explicite |
| H3 | **sqlite.js** est interprété comme le package npm `sql.js` (SQLite compilé en WebAssembly) — seul driver SQLite supporté par TypeORM excluant `sqlite3` et `better-sqlite3`. **Confirmé le 2026-03-31.** | Validé explicitement |
| H4 | La persistance fichier est gérée via les options natives du driver TypeORM `sqljs` : `location: 'data/db.sqlite'` (chemin fichier) + `autoSave: true` (sauvegarde automatique après chaque écriture). Aucun `fs.writeFileSync` manuel requis. | Validé le 2026-03-31 — B3 |
| H5 | L'API de santé backend répond sur `GET /health` (ou `GET /api/health`) et retourne un état JSON : statut API + statut connexion BDD | Déduit du cahier des charges |
| H6 | Le frontend appelle l'API backend via une variable d'environnement `VITE_API_URL` | Bonne pratique Vite |
| H7 | Swagger UI est exposé sur `/api/docs` côté backend | Convention NestJS |
| H8 | Le préfixe global des routes backend est `/api` | Convention NestJS recommandée |
| H9 | Le package `/shared` est un workspace npm interne consommé par `/frontend` et `/backend` via le chemin workspace | Bonne pratique monorepo npm |
| H10 | TypeScript est activé dans les trois packages (`/frontend`, `/backend`, `/shared`) avec des `tsconfig.json` stricts | Contrainte qualité production |
| H11 | La couverture minimale de 80% s'applique séparément à chaque package (`/frontend` et `/backend`), pas au global | Contrainte explicite |
| H12 | Le port backend par défaut est `3000`, le port frontend Vite par défaut est `5173` | Conventions des frameworks |

---

## 2. Décisions validées

> Toutes les décisions ci-dessous ont été explicitement confirmées le **2026-03-31**. Aucun point bloquant restant.

| Code | Sujet | Décision retenue |
|------|-------|-----------------|
| ✅ B1 | Driver SQLite | `sql.js` (package npm) — driver TypeORM `sqljs` — WebAssembly SQLite. `sqlite3` et `better-sqlite3` exclus. |
| ✅ B2 | CORS | Configurable via variable d'environnement `CORS_ORIGIN` dans `backend/.env`. Valeur par défaut : `http://localhost:5173`. |
| ✅ B3 | Persistance SQLite | Fichier `data/db.sqlite` via options TypeORM natives : `location: 'data/db.sqlite'` + `autoSave: true`. Pas de code manuel. |
| ✅ B4 | Format `/health` | `{ "status": "ok\|error", "database": "ok\|error", "timestamp": "<ISO 8601>" }` |
| ✅ B5 | Variables d'environnement | Un `.env` par package : `frontend/.env` (préfixe `VITE_*`) + `backend/.env` (`process.env`). |

### Note technique sur `sql.js` + TypeORM (persistance)

Le driver TypeORM `sqljs` gère la persistance via :

```
type: 'sqljs'
location: 'data/db.sqlite'   → chemin fichier (lecture au démarrage, écriture après chaque commit)
autoSave: true               → déclenche la sauvegarde automatiquement après chaque écriture
synchronize: true            → acceptable en développement, désactiver en production
autoLoadEntities: true       → chargement automatique des entités enregistrées
```

> **Comportement :** au démarrage, TypeORM charge `data/db.sqlite` s'il existe. À chaque transaction, il sauvegarde automatiquement le buffer WebAssembly dans le fichier. Aucune logique custom de sauvegarde n'est requise dans le `DatabaseModule`.

---

## 3. Arborescence cible

```
session12/                          ← racine du monorepo
├── package.json                    ← npm workspaces root
├── .gitignore
├── .npmrc
├── tsconfig.base.json              ← tsconfig partagé (strict mode)
├── ARCHITECTURE.md                 ← ce document
│
├── shared/                         ← package partagé (types, contrats)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       └── types/
│           └── health.types.ts     ← ex: IHealthResponse
│
├── frontend/                       ← application React 18 + Vite
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── jest.config.ts
│   ├── jest.setup.ts
│   ├── .env.example
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── App.test.tsx
│       ├── vite-env.d.ts
│       ├── api/
│       │   ├── health.api.ts       ← appel HTTP vers GET /api/health
│       │   └── health.api.test.ts
│       └── components/
│           └── (vide à ce stade — fondation uniquement)
│
├── backend/                        ← application NestJS
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── jest.config.ts
│   ├── .env.example
│   └── src/
│       ├── main.ts                 ← bootstrap NestJS + Swagger
│       ├── app.module.ts           ← AppModule racine
│       ├── database/
│       │   ├── database.module.ts  ← TypeORM + sqljs (sql.js) config
│       │   └── database.module.spec.ts
│       └── health/
│           ├── health.module.ts
│           ├── health.controller.ts
│           ├── health.controller.spec.ts
│           ├── health.service.ts
│           ├── health.service.spec.ts
│           └── dto/
│               └── health-response.dto.ts
└── data/                           ← (si persistance fichier validée — B3)
    └── .gitkeep
```

---

## 4. Plan de mise en œuvre par étapes

### Phase 1 — Scaffolding du monorepo

**Objectif :** Créer la structure racine, npm workspaces, tsconfig de base.

| Étape | Action | Fichier(s) |
|-------|--------|-----------|
| 1.1 | `package.json` racine avec workspaces | `package.json` |
| 1.2 | `.gitignore` complet (node_modules, dist, .env, data) | `.gitignore` |
| 1.3 | `.npmrc` (save-exact, engine-strict) | `.npmrc` |
| 1.4 | `tsconfig.base.json` strict partagé | `tsconfig.base.json` |

---

### Phase 2 — Package `/shared`

**Objectif :** Créer le package de types partagés, compilable et consommable par les deux autres packages.

| Étape | Action | Fichier(s) |
|-------|--------|-----------|
| 2.1 | `package.json` du package shared | `shared/package.json` |
| 2.2 | `tsconfig.json` étendant base | `shared/tsconfig.json` |
| 2.3 | Type `IHealthResponse` partagé | `shared/src/types/health.types.ts` |
| 2.4 | Barrel `index.ts` | `shared/src/index.ts` |

---

### Phase 3 — Backend NestJS

**Objectif :** Bootstrap NestJS fonctionnel avec TypeORM/sql.js (`sqljs` driver), route `/api/health`, Swagger.

| Étape | Action | Fichier(s) |
|-------|--------|-----------|
| 3.1 | `package.json` backend | `backend/package.json` |
| 3.2 | `tsconfig.json` + `tsconfig.build.json` | `backend/tsconfig*.json` |
| 3.3 | `jest.config.ts` backend | `backend/jest.config.ts` |
| 3.4 | `DatabaseModule` : TypeORM `sqljs`, `location: data/db.sqlite`, `autoSave: true` | `backend/src/database/` |
| 3.5 | `HealthModule` : controller + service + DTO | `backend/src/health/` |
| 3.6 | `AppModule` : import DatabaseModule + HealthModule | `backend/src/app.module.ts` |
| 3.7 | `main.ts` : bootstrap, Swagger setup, CORS, prefix `/api` | `backend/src/main.ts` |
| 3.8 | `.env.example` backend | `backend/.env.example` |

---

### Phase 4 — Frontend React/Vite

**Objectif :** Frontend minimal qui appelle `GET /api/health` et affiche la réponse.

| Étape | Action | Fichier(s) |
|-------|--------|-----------|
| 4.1 | `package.json` frontend | `frontend/package.json` |
| 4.2 | `tsconfig.json` + `tsconfig.node.json` | `frontend/tsconfig*.json` |
| 4.3 | `vite.config.ts` | `frontend/vite.config.ts` |
| 4.4 | `tailwind.config.ts` + `postcss.config.js` | `frontend/tailwind.config.ts` |
| 4.5 | `jest.config.ts` + `jest.setup.ts` | `frontend/jest.config.ts` |
| 4.6 | `health.api.ts` : fetch vers `VITE_API_URL/health` | `frontend/src/api/health.api.ts` |
| 4.7 | `App.tsx` : affichage état API (loading / ok / error) | `frontend/src/App.tsx` |
| 4.8 | `main.tsx` + `index.html` | `frontend/src/main.tsx` |
| 4.9 | `.env.example` frontend | `frontend/.env.example` |

---

### Phase 5 — Tests unitaires

**Objectif :** Couvrir chaque unité testable à ≥ 80%.

| Étape | Action | Fichier(s) |
|-------|--------|-----------|
| 5.1 | Tests backend : `health.service.spec.ts`, `health.controller.spec.ts`, `database.module.spec.ts` | `backend/src/` |
| 5.2 | Tests frontend : `App.test.tsx`, `health.api.test.ts` | `frontend/src/` |
| 5.3 | Vérification couverture via `--coverage` | scripts npm |

---

## 5. Documentation d'architecture

### 5.1 Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                        MONOREPO ROOT                         │
│  npm workspaces — tsconfig.base.json                         │
│                                                              │
│  ┌──────────────┐   IHealthResponse   ┌──────────────────┐  │
│  │   /frontend  │ ◄────────────────── │    /shared       │  │
│  │  React 18    │                     │  Types partagés  │  │
│  │  Vite        │                     └──────────────────┘  │
│  │  TypeScript  │                              ▲             │
│  │  Tailwind    │         IHealthResponse       │             │
│  │  Jest        │                     ┌──────────────────┐  │
│  │              │ ──── HTTP GET ────► │    /backend      │  │
│  │              │ ◄── JSON response── │  NestJS          │  │
│  └──────────────┘  /api/health        │  TypeORM (sqljs) │  │
│                                       │  sql.js (WASM)   │  │
│                                       │  Swagger         │  │
│                                       │  Jest            │  │
│                                       └────────┬─────────┘  │
│                                                │             │
│                                       ┌────────▼─────────┐  │
│                                       │  SQLite (sql.js)  │  │
│                                       │  Fichier :        │  │
│                                       │  data/db.sqlite   │  │
│                                       └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

### 5.2 Responsabilités par package

#### `/shared`
- **Rôle :** Source unique de vérité pour les contrats de données partagés entre frontend et backend.
- **Contenu :** Interfaces TypeScript, types utilitaires, constantes partagées.
- **Règle :** Aucune dépendance runtime. TypeScript pur. Pas de logique, pas d'effets de bord.
- **Consommation :** Importé comme workspace dans `frontend` et `backend` via `"@app/shared": "*"`.

#### `/backend`
- **Rôle :** API REST NestJS. Expose des endpoints documentés via Swagger. Gère la connexion BDD.
- **Modules à ce stade :**
  - `DatabaseModule` : initialisation TypeORM avec driver `sqljs` (sql.js), `location: 'data/db.sqlite'`, `autoSave: true`. DataSource singleton.
  - `HealthModule` : controller + service pour `GET /api/health`.
- **Règle :** Architecture NestJS stricte. Modules autonomes. Services injectables. DTOs décorés Swagger.
- **Port :** `3000` (configurable via `.env`)

#### `/frontend`
- **Rôle :** SPA React 18 servie par Vite. Consomme l'API backend. Affiche l'état de santé.
- **Contenu à ce stade :**
  - `health.api.ts` : couche d'abstraction HTTP (fetch ou axios) vers `/api/health`.
  - `App.tsx` : composant racine affichant l'état retourné.
- **Règle :** Aucune logique métier. Tailwind pour le style générique. Types partagés via `@app/shared`.
- **Port Vite :** `5173` (configurable)

---

### 5.3 Flux de données

```
Utilisateur
    │
    ▼
[Browser] charge http://localhost:5173
    │
    ▼
[App.tsx] monte → appelle health.api.ts
    │
    ▼
[health.api.ts] GET http://localhost:3000/api/health
    │
    ▼
[NestJS Router] route vers HealthController
    │
    ▼
[HealthController.getHealth()] appelle HealthService
    │
    ▼
[HealthService.check()] interroge DataSource TypeORM
    │
    ├── DataSource.isInitialized ? → "ok" | "error"
    │
    ▼
[HealthService] retourne IHealthResponse { status, database, timestamp }
    │
    ▼
[HealthController] serialise via HealthResponseDto → HTTP 200
    │
    ▼
[health.api.ts] reçoit la réponse JSON
    │
    ▼
[App.tsx] affiche l'état : "API OK — Database OK"
    │
    ▼
[Browser] rendu Tailwind
```

---

## 6. Stratégie de tests et couverture

### 6.1 Principes généraux

- Un fichier de test par unité testable (service, controller, composant, fonction utilitaire).
- Colocation des tests avec le code source (`.spec.ts` / `.test.tsx`).
- Pas de tests d'intégration ni e2e dans cette fondation.
- Mocks explicites pour les dépendances externes (TypeORM DataSource, fetch).

### 6.2 Backend — Jest + NestJS Testing Module

| Fichier testé | Fichier de test | Ce qui est testé |
|---------------|-----------------|-----------------|
| `health.service.ts` | `health.service.spec.ts` | Retour correct si BDD ok / BDD KO |
| `health.controller.ts` | `health.controller.spec.ts` | Délégation au service, format de réponse |
| `database.module.ts` | `database.module.spec.ts` | Configuration DataSource (type, database) |

**Configuration Jest backend :**
- `transform` : `ts-jest`
- `testEnvironment` : `node`
- `coverageThreshold` : `{ global: { lines: 80, functions: 80, branches: 80, statements: 80 } }`
- `collectCoverageFrom` : `["src/**/*.ts", "!src/main.ts", "!src/**/*.module.ts"]`

> **Justification de l'exclusion de `main.ts` et `*.module.ts` :** Ces fichiers sont du câblage NestJS pur (bootstrap, imports de modules). Ils ne contiennent pas de logique testable unitairement et dégradent artificiellement le ratio de couverture.

### 6.3 Frontend — Jest + React Testing Library

| Fichier testé | Fichier de test | Ce qui est testé |
|---------------|-----------------|-----------------|
| `health.api.ts` | `health.api.test.ts` | Appel fetch correct, parsing JSON, gestion erreur |
| `App.tsx` | `App.test.tsx` | Rendu initial (loading), rendu succès, rendu erreur |

**Configuration Jest frontend :**
- `transform` : `ts-jest` ou `babel-jest` avec preset React
- `testEnvironment` : `jsdom`
- `setupFilesAfterFramework` : `jest.setup.ts` (import `@testing-library/jest-dom`)
- `moduleNameMapper` : résolution des alias `@app/shared`
- `coverageThreshold` : `{ global: { lines: 80, functions: 80, branches: 80, statements: 80 } }`

### 6.4 Couverture — seuils et périmètre

```
Package     | Outil    | Seuil lignes | Seuil branches | Seuil fonctions
------------|----------|-------------|----------------|----------------
/backend    | Jest     | 80%          | 80%            | 80%
/frontend   | Jest     | 80%          | 80%            | 80%
/shared     | (optionnel, types purs — pas de logique à couvrir)
```

---

## 7. Structure Swagger / DTO / Entités

### 7.1 Configuration Swagger (backend)

Dans [`main.ts`](backend/src/main.ts) :

```
SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, {
  title: 'API Foundation',
  description: 'Generic full-stack foundation — technical layer only',
  version: '1.0',
}))
```

URL d'accès : `http://localhost:3000/api/docs`

### 7.2 DTO exposé

#### `HealthResponseDto`

| Propriété | Type | Décorateur Swagger | Description |
|-----------|------|--------------------|-------------|
| `status` | `'ok' \| 'error'` | `@ApiProperty({ enum: ['ok', 'error'] })` | Statut de l'API |
| `database` | `'ok' \| 'error'` | `@ApiProperty({ enum: ['ok', 'error'] })` | Statut connexion BDD |
| `timestamp` | `string` (ISO 8601) | `@ApiProperty({ example: '2026-03-31T15:00:00Z' })` | Heure de la réponse |

### 7.3 Entités TypeORM

À ce stade de fondation : **aucune entité métier**. 

Seule la configuration `DataSource` sans entité est créée dans `DatabaseModule`, ce qui valide que TypeORM + sql.js s'initialise et persiste correctement. Les entités seront ajoutées lors du développement produit.

```
// DatabaseModule — DataSource config (description, pas de code)
type: 'sqljs'
location: 'data/db.sqlite'    // lit le fichier au démarrage, écrit après chaque commit
autoSave: true                 // sauvegarde automatique — pas de code manuel
autoLoadEntities: true         // chargement auto des entités NestJS
synchronize: true              // dev uniquement — désactiver en production
```

### 7.4 Route documentée

| Méthode | Route | Controller | Description Swagger |
|---------|-------|------------|---------------------|
| `GET` | `/api/health` | `HealthController` | `@ApiOperation({ summary: 'Health check — API and database status' })` |
| — | — | — | `@ApiOkResponse({ type: HealthResponseDto })` |

---

## 8. Scripts npm workspaces

### 8.1 Racine (`package.json` root)

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `npm run dev -w frontend & npm run dev -w backend` | Lance frontend + backend en parallèle |
| `build` | `npm run build --workspaces` | Build tous les packages |
| `test` | `npm run test --workspaces` | Lance Jest dans chaque workspace |
| `test:coverage` | `npm run test:coverage --workspaces` | Couverture dans chaque workspace |
| `lint` | `npm run lint --workspaces` | Lint dans chaque workspace |
| `typecheck` | `npm run typecheck --workspaces` | Vérification TS dans chaque workspace |

### 8.2 `/shared`

| Script | Commande |
|--------|----------|
| `build` | `tsc --project tsconfig.json` |
| `typecheck` | `tsc --noEmit` |

### 8.3 `/backend`

| Script | Commande |
|--------|----------|
| `dev` | `nest start --watch` |
| `build` | `nest build` |
| `start` | `node dist/main` |
| `test` | `jest` |
| `test:coverage` | `jest --coverage` |
| `test:watch` | `jest --watch` |
| `lint` | `eslint "src/**/*.ts"` |
| `typecheck` | `tsc --noEmit` |

### 8.4 `/frontend`

| Script | Commande |
|--------|----------|
| `dev` | `vite` |
| `build` | `tsc && vite build` |
| `preview` | `vite preview` |
| `test` | `jest` |
| `test:coverage` | `jest --coverage` |
| `test:watch` | `jest --watch` |
| `lint` | `eslint "src/**/*.{ts,tsx}"` |
| `typecheck` | `tsc --noEmit` |

---

## 9. Checklist avant génération du code

### ✅ Toutes les décisions sont validées — génération du code possible

### Décisions techniques (confirmées)

- [x] Framework frontend : React 18 + Vite + TypeScript + Tailwind CSS
- [x] Framework backend : NestJS + TypeScript
- [x] ORM : TypeORM
- [x] Driver SQLite : `sql.js` (package npm) — driver TypeORM `sqljs`
- [x] Persistance SQLite : fichier `data/db.sqlite` via `location` + `autoSave: true`
- [x] CORS : configurable via `CORS_ORIGIN` (défaut `http://localhost:5173`)
- [x] Format `/health` : `{ status, database, timestamp }`
- [x] Variables d'environnement : `.env` par package
- [x] Tests : Jest (frontend + backend)
- [x] Documentation API : Swagger sur `/api/docs`
- [x] Gestion monorepo : npm workspaces
- [x] Couverture minimale : 80% par package (séparément)
- [x] Pas d'authentification
- [x] Pas de logique métier
- [x] Pas de CRUD
- [x] Pas de rôles / permissions

---

## 10. Alternatives éventuelles

> Ces alternatives sont proposées **à titre informatif uniquement**. Elles ne remettent en cause aucun choix validé. Aucune ne sera appliquée sans validation explicite.

### ALT-1 : Comparatif drivers SQLite TypeORM (pour référence)

| | `sql.js` ✅ **retenu** | `better-sqlite3` ❌ exclu | `sqlite3` ❌ exclu |
|---|---|---|---|
| **API TypeORM** | `sqljs` | `better-sqlite3` | `sqlite` |
| **Persistance** | Fichier via `location` + `autoSave` | Fichier natif automatique | Fichier natif automatique |
| **Runtime** | WebAssembly | Natif C++ | Natif C++ |
| **Dépendance native** | ❌ Non (WASM pur) | ✅ Oui (`node-gyp`) | ✅ Oui (`node-gyp`) |
| **CI/CD** | ✅ Simple | ⚠️ Compilation native | ⚠️ Compilation native |
| **Performances** | Correctes | Très bonnes | Bonnes |

> `sql.js` est le seul driver sans dépendance native compilée — avantage significatif en CI/CD.

---

### ALT-2 : Turborepo à la place de npm workspaces pur

| | npm workspaces (choix contraint) | Turborepo |
|---|---|---|
| **Complexité** | Minimale | Modérée |
| **Cache build** | ❌ Non | ✅ Oui |
| **Orchestration tâches** | Manuel (`&`) | Pipeline déclaratif |
| **Adoption** | Standard npm | Dépendance supplémentaire |

> npm workspaces est le choix imposé. Turborepo pourrait être ajouté plus tard sans remettre en cause l'architecture.

---

### ALT-3 : Axios à la place de `fetch` natif côté frontend

| | `fetch` natif | `axios` |
|---|---|---|
| **Dépendance** | Aucune (natif navigateur) | Package npm (~50kb) |
| **TypeScript** | Types natifs | Types inclus (`axios`) |
| **Intercepteurs** | ❌ Non natif | ✅ Oui |
| **Adaptation future** | Refactor si intercepteurs nécessaires | Prêt à l'emploi |

> Pour une fondation minimale, `fetch` natif est suffisant et sans dépendance. `axios` sera pertinent si des intercepteurs (auth, retry) sont introduits plus tard.

---

*Document d'architecture finalisé le 2026-03-31 — toutes décisions validées — génération du code possible.*
