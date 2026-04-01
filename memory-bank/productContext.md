# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2026-03-31 14:12:07 - Memory Bank initialized.

*

## Project Goal

*   Concevoir et implémenter une **fondation full-stack générique** dans un monorepo npm workspaces — sans logique métier, sans fonctionnalités produit. Fondation prête pour un contexte de production.
*   [2026-04-01] Étendre le backend avec un **module complet de gestion des notes de frais** (expense reports, expenses, attachments) — architecture modulaire NestJS.

## Key Features

*   Monorepo npm workspaces avec trois packages : `/frontend`, `/backend`, `/shared`
*   Frontend : React 18 + Vite + TypeScript + Tailwind CSS + Jest
*   Backend : NestJS + TypeScript + TypeORM + sql.js (SQLite) + Swagger + Jest
*   Shared : types TypeScript partagés (ex: `IHealthResponse`)
*   Route API minimale `GET /api/health` : vérifie API + connexion BDD
*   Documentation Swagger sur `/api/docs`
*   Couverture de tests ≥ 80% par package (frontend et backend séparément)
*   Aucune authentification, aucun CRUD, aucune logique métier
*   [2026-04-01] **Gestion des notes de frais** : ExpenseReport → Expenses → ExpenseAttachments, avec upload de fichiers, filtres avancés et règles métier complètes

## Overall Architecture

*   Monorepo npm workspaces (racine) → trois packages autonomes
*   `/shared` : types purs TypeScript, pas de dépendance runtime
*   `/backend` : NestJS modulaire (DatabaseModule + HealthModule + ExpenseReportsModule + ExpensesModule + ExpenseAttachmentsModule), port 3000, prefix `/api`
*   `/frontend` : SPA React 18 Vite, port 5173, appelle `/api/health` au démarrage
*   Communication frontend → backend : HTTP REST (fetch natif)
*   Base de données : SQLite via sql.js (TypeORM driver `sqljs`), stockage en mémoire ou fichier selon validation B3
*   Swagger UI : http://localhost:3000/api/docs
*   [2026-04-01] Fichiers uploadés : stockage disque `backend/uploads/`, exposition statique `/uploads/*` via `ServeStaticModule`

2026-04-01 09:12:00 - Ajout du module de gestion des notes de frais (expense management). Architecture détaillée dans memory-bank/expense-management-architecture.md.
