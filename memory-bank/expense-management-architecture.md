# Architecture — Expense Management Backend

> **Status:** ✅ Plan complet — prêt pour implémentation en mode Code.
> **Date:** 2026-04-01
> **Scope:** Backend NestJS — gestion des notes de frais (expense reports, expenses, attachments).
> **Base:** Monorepo existant session12 — patterns identiques au module `health`.

---

## Points d'attention critiques (lire en premier)

| # | Point | Impact |
|---|-------|--------|
| P1 | Le driver TypeORM `sqljs` utilise `synchronize: true` — **pas de migration CLI classique** possible avec ce driver. Les migrations documentées ci-dessous sont des fichiers de référence structurels. Le schéma est synchronisé automatiquement au démarrage. | Fichiers migrations = documentation/référence uniquement |
| P2 | `@nestjs/platform-express` est **déjà présent** (v10.3.10) — multer est bundlé dedans. Seul `@types/multer` manque en devDependencies. | Ne pas installer `multer` directement |
| P3 | `class-validator` et `class-transformer` sont **absents** des dépendances — requis pour `ValidationPipe` et les décorateurs `@IsString()`, `@IsEnum()`, etc. | Bloquerait toute validation DTO |
| P4 | Les fichiers uploadés doivent être servis statiquement via `ServeStaticModule` — package `@nestjs/serve-static` absent. | Requis pour GET /uploads/... |
| P5 | Le répertoire `uploads/` doit être créé à la racine de `backend/` et ajouté au `.gitignore` (sauf `.gitkeep`). | Sinon les uploads échouent au démarrage |
| P6 | Ajouter `app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))` dans `main.ts` — absent actuellement. | Requis pour valider tous les DTOs entrants |

---

## 1. Structure complète des fichiers à créer

```
backend/src/
├── common/
│   └── enums/
│       ├── expense-report-status.enum.ts      ← enum ExpenseReportStatus
│       ├── expense-status.enum.ts             ← enum ExpenseStatus
│       └── expense-category.enum.ts           ← enum ExpenseCategory
│
├── expense-reports/
│   ├── expense-reports.module.ts
│   ├── expense-reports.controller.ts          ← routes /expense-reports
│   ├── expense-reports.service.ts
│   ├── entities/
│   │   └── expense-report.entity.ts           ← entité TypeORM ExpenseReport
│   └── dto/
│       ├── create-expense-report.dto.ts
│       ├── update-expense-report.dto.ts       ← PartialType de create (sauf status)
│       ├── expense-report-response.dto.ts     ← réponse complète avec relations
│       ├── expense-report-list-response.dto.ts ← réponse paginée
│       └── query-expense-reports.dto.ts       ← query params filtres + pagination
│
├── expenses/
│   ├── expenses.module.ts
│   ├── expenses.controller.ts                 ← routes /expense-reports/:reportId/expenses
│   ├── expenses.service.ts
│   ├── entities/
│   │   └── expense.entity.ts                  ← entité TypeORM Expense
│   └── dto/
│       ├── create-expense.dto.ts
│       ├── update-expense.dto.ts              ← PartialType de create (sauf status)
│       └── expense-response.dto.ts
│
├── expense-attachments/
│   ├── expense-attachments.module.ts
│   ├── expense-attachments.controller.ts     ← routes /.../attachments
│   ├── expense-attachments.service.ts
│   ├── entities/
│   │   └── expense-attachment.entity.ts      ← entité TypeORM ExpenseAttachment
│   ├── dto/
│   │   └── attachment-response.dto.ts
│   └── multer/
│       └── multer-config.factory.ts          ← DiskStorageOptions factory (uuid + ext)
│
└── database/
    └── seeds/
        └── expense-reports.seed.ts           ← script de seed de démonstration
```

**Fichiers migrations (référence uniquement — schéma géré par `synchronize: true`) :**
```
backend/src/database/migrations/
├── 1712000000000-CreateExpenseReports.ts
├── 1712000001000-CreateExpenses.ts
└── 1712000002000-CreateExpenseAttachments.ts
```

---

## 2. Dépendances manquantes

### 2.1 Dépendances de production à ajouter dans `backend/package.json`

```json
"class-validator": "0.14.1",
"class-transformer": "0.5.1",
"uuid": "9.0.1",
"@nestjs/serve-static": "4.0.0",
"@nestjs/config": "3.2.3"
```

> **Note :** `@nestjs/config` est optionnel — les variables d'environnement sont déjà lues via `process.env` dans le projet. À inclure uniquement si une `ConfigService` typée est voulue. Le plan ci-dessous utilise `process.env` direct (cohérent avec l'existant).

### 2.2 Dépendances de développement à ajouter

```json
"@types/multer": "1.4.11",
"@types/uuid": "9.0.8"
```

### 2.3 Packages déjà présents (ne pas réinstaller)

| Package | Version | Raison |
|---------|---------|--------|
| `@nestjs/platform-express` | 10.3.10 | ✅ Multer bundlé dedans |
| `@nestjs/swagger` | 7.4.0 | ✅ Déjà configuré |
| `@nestjs/typeorm` | 10.0.2 | ✅ Déjà configuré |
| `typeorm` | 0.3.20 | ✅ Déjà configuré |

### 2.4 Commande d'installation

```bash
cd backend && npm install class-validator@0.14.1 class-transformer@0.5.1 uuid@9.0.1 @nestjs/serve-static@4.0.0
npm install --save-dev @types/multer@1.4.11 @types/uuid@9.0.8
```

---

## 3. Modèle de données complet

### 3.1 Entité `ExpenseReport`

**Fichier :** `backend/src/expense-reports/entities/expense-report.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index
} from 'typeorm';
import { ExpenseReportStatus } from '../../common/enums/expense-report-status.enum';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('expense_reports')
export class ExpenseReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  purpose: string;

  @Column({ type: 'date' })
  reportDate: string;                        // stocké comme 'YYYY-MM-DD'

  @Column({
    type: 'simple-enum',
    enum: ExpenseReportStatus,
    default: ExpenseReportStatus.CREATED,
  })
  @Index()
  status: ExpenseReportStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'datetime', nullable: true, default: null })
  submittedAt: string | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Expense, (expense) => expense.expenseReport, {
    cascade: ['insert', 'update', 'remove'],
    eager: false,
  })
  expenses: Expense[];
}
```

**Index :** `status` (filtrage fréquent), `createdAt` (tri par défaut), `reportDate` (filtrage par date).

---

### 3.2 Entité `Expense`

**Fichier :** `backend/src/expenses/entities/expense.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index
} from 'typeorm';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { ExpenseReport } from '../../expense-reports/entities/expense-report.entity';
import { ExpenseAttachment } from '../../expense-attachments/entities/expense-attachment.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  expenseReportId: string;

  @Column({ type: 'simple-enum', enum: ExpenseCategory })
  @Index()
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  expenseName: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'date' })
  expenseDate: string;                       // stocké comme 'YYYY-MM-DD'

  @Column({
    type: 'simple-enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.CREATED,
  })
  @Index()
  status: ExpenseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ExpenseReport, (report) => report.expenses, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'expenseReportId' })
  expenseReport: ExpenseReport;

  @OneToMany(() => ExpenseAttachment, (att) => att.expense, {
    cascade: ['insert', 'update', 'remove'],
    eager: false,
  })
  attachments: ExpenseAttachment[];
}
```

**Index :** `expenseReportId` (jointure), `category` (filtre OR catégories), `status`.

---

### 3.3 Entité `ExpenseAttachment`

**Fichier :** `backend/src/expense-attachments/entities/expense-attachment.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index
} from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('expense_attachments')
export class ExpenseAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  expenseId: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;                      // nom original du fichier uploadé

  @Column({ type: 'varchar', length: 255 })
  fileName: string;                          // nom stocké sur disque (uuid + extension)

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;                          // ex: 'image/jpeg', 'application/pdf'

  @Column({ type: 'int' })
  size: number;                              // taille en octets

  @Column({ type: 'varchar', length: 20 })
  extension: string;                         // ex: '.pdf', '.jpg'

  @Column({ type: 'varchar', length: 500 })
  storagePath: string;                       // chemin absolu fichier sur disque

  @Column({ type: 'varchar', length: 500 })
  url: string;                               // URL publique ex: /uploads/uuid.pdf

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Expense, (expense) => expense.attachments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'expenseId' })
  expense: Expense;
}
```

---

## 4. Enums centralisées

### 4.1 `ExpenseReportStatus`

**Fichier :** `backend/src/common/enums/expense-report-status.enum.ts`

```typescript
export enum ExpenseReportStatus {
  CREATED   = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  DENIED    = 'DENIED',
  PAID      = 'PAID',
}
```

### 4.2 `ExpenseStatus`

**Fichier :** `backend/src/common/enums/expense-status.enum.ts`

```typescript
export enum ExpenseStatus {
  CREATED   = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED  = 'ACCEPTED',
  DENIED    = 'DENIED',
}
```

### 4.3 `ExpenseCategory`

**Fichier :** `backend/src/common/enums/expense-category.enum.ts`

```typescript
export enum ExpenseCategory {
  TRAVEL          = 'TRAVEL',
  HOTEL           = 'HOTEL',
  RESTAURANT      = 'RESTAURANT',
  TRANSPORT       = 'TRANSPORT',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  TEAM_EVENT      = 'TEAM_EVENT',
  OTHER           = 'OTHER',
}
```

---

## 5. API complète

> Toutes les routes sont préfixées `/api` (global prefix NestJS existant).

### 5.1 Expense Reports — `/api/expense-reports`

| Méthode | Chemin | Description | Codes retour |
|---------|--------|-------------|--------------|
| `POST` | `/expense-reports` | Créer une note de frais | `201 Created`, `400 Bad Request` |
| `GET` | `/expense-reports` | Lister avec filtres + pagination + tri | `200 OK` |
| `GET` | `/expense-reports/:reportId` | Obtenir une note de frais (avec expenses + attachments) | `200 OK`, `404 Not Found` |
| `PUT` | `/expense-reports/:reportId` | Mettre à jour complètement (remplacement) | `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found` |
| `PATCH` | `/expense-reports/:reportId` | Mettre à jour partiellement | `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found` |
| `DELETE` | `/expense-reports/:reportId` | Supprimer (cascade expenses + attachments) | `204 No Content`, `404 Not Found` |
| `POST` | `/expense-reports/:reportId/submit` | Soumettre la note de frais | `200 OK`, `400 Bad Request`, `404 Not Found` |

### 5.2 Expenses — `/api/expense-reports/:reportId/expenses`

| Méthode | Chemin | Description | Codes retour |
|---------|--------|-------------|--------------|
| `POST` | `/expense-reports/:reportId/expenses` | Ajouter une dépense | `201 Created`, `400 Bad Request`, `403 Forbidden`, `404 Not Found` |
| `GET` | `/expense-reports/:reportId/expenses` | Lister les dépenses d'un report | `200 OK`, `404 Not Found` |
| `GET` | `/expense-reports/:reportId/expenses/:expenseId` | Obtenir une dépense (avec attachments) | `200 OK`, `404 Not Found` |
| `PUT` | `/expense-reports/:reportId/expenses/:expenseId` | Mettre à jour complètement | `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found` |
| `PATCH` | `/expense-reports/:reportId/expenses/:expenseId` | Mettre à jour partiellement | `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found` |
| `DELETE` | `/expense-reports/:reportId/expenses/:expenseId` | Supprimer (cascade attachments) | `204 No Content`, `403 Forbidden`, `404 Not Found` |

### 5.3 Attachments — `/api/expense-reports/:reportId/expenses/:expenseId/attachments`

| Méthode | Chemin | Description | Codes retour |
|---------|--------|-------------|--------------|
| `POST` | `.../attachments` | Uploader un fichier (`multipart/form-data`, champ `file`) | `201 Created`, `400 Bad Request`, `404 Not Found`, `413 Payload Too Large` |
| `GET` | `.../attachments` | Lister les attachments d'une dépense | `200 OK`, `404 Not Found` |
| `GET` | `.../attachments/:attachmentId` | Obtenir les métadonnées d'un attachment | `200 OK`, `404 Not Found` |
| `DELETE` | `.../attachments/:attachmentId` | Supprimer (physique + BDD) | `204 No Content`, `404 Not Found` |
| `GET` | `.../attachments/:attachmentId/download` | Télécharger le fichier (stream) | `200 OK`, `404 Not Found` |

---

## 6. Filtres et pagination — `GET /expense-reports`

**Fichier DTO :** `backend/src/expense-reports/dto/query-expense-reports.dto.ts`

| Paramètre | Type | Description | Validation |
|-----------|------|-------------|------------|
| `page` | `number` | Numéro de page (défaut: 1) | `@IsOptional()`, `@IsInt()`, `@Min(1)`, `@Type(() => Number)` |
| `limit` | `number` | Résultats par page (défaut: 10, max: 100) | `@IsOptional()`, `@IsInt()`, `@Min(1)`, `@Max(100)`, `@Type(() => Number)` |
| `search` | `string` | Recherche partielle sur `purpose` (ILIKE) | `@IsOptional()`, `@IsString()`, `@MaxLength(255)` |
| `status` | `ExpenseReportStatus` | Filtrer par statut exact | `@IsOptional()`, `@IsEnum(ExpenseReportStatus)` |
| `reportDateFrom` | `string` | Date début (format YYYY-MM-DD, inclusif) | `@IsOptional()`, `@IsDateString()` |
| `reportDateTo` | `string` | Date fin (format YYYY-MM-DD, inclusif) | `@IsOptional()`, `@IsDateString()` |
| `minTotalAmount` | `number` | Montant total minimum (inclusif) | `@IsOptional()`, `@IsNumber()`, `@Min(0)`, `@Type(() => Number)` |
| `maxTotalAmount` | `number` | Montant total maximum (inclusif) | `@IsOptional()`, `@IsNumber()`, `@Min(0)`, `@Type(() => Number)` |
| `expenseCategories` | `ExpenseCategory[]` | Filtre OR — reports ayant au moins une expense dans ces catégories | `@IsOptional()`, `@IsArray()`, `@IsEnum(ExpenseCategory, { each: true })` |
| `sortBy` | `string` | Champ de tri | `@IsOptional()`, `@IsIn(['purpose', 'reportDate', 'totalAmount', 'status', 'createdAt', 'updatedAt'])` |
| `sortOrder` | `string` | Ordre de tri (défaut: `desc`) | `@IsOptional()`, `@IsIn(['asc', 'desc'])` |

**Implémentation QueryBuilder — points clés :**

```typescript
// expenseCategories → sous-requête EXISTS
if (query.expenseCategories?.length) {
  qb.andWhere(
    `EXISTS (
      SELECT 1 FROM expenses e
      WHERE e.expenseReportId = report.id
      AND e.category IN (:...categories)
    )`,
    { categories: query.expenseCategories }
  );
}

// search → LIKE sur purpose
if (query.search) {
  qb.andWhere('LOWER(report.purpose) LIKE LOWER(:search)', {
    search: `%${query.search}%`
  });
}
```

**Structure de réponse paginée :**

```typescript
// ExpenseReportListResponseDto
{
  data: ExpenseReportResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## 7. Règles métier

### 7.1 ExpenseReport Service

| Règle | Implémentation |
|-------|----------------|
| À la création : `status = CREATED`, `submittedAt = null`, `totalAmount = 0` | Forcer ces valeurs dans `create()` avant insert |
| Modification interdite si `status IN [VALIDATED, DENIED]` | Vérifier en début de `update()` / `patch()` → throw `ForbiddenException` |
| Suppression possible quel que soit le statut | Pas de garde sur `delete()` — cascade TypeORM supprime expenses + attachments |
| **Submit** : `status → SUBMITTED`, `submittedAt = new Date()`, toutes expenses → `SUBMITTED` | Transaction atomique dans `submit()` |
| Le `status` n'est PAS modifiable via PUT/PATCH | `PartialType` du DTO de création qui **exclut** `status` — champ `status` absent de `UpdateExpenseReportDto` |
| `totalAmount` recalculé automatiquement | Pas recalculé depuis ExpenseReport — géré par le service `Expenses` (voir 7.2) |

**Méthode submit — pseudocode :**
```typescript
async submit(reportId: string): Promise<ExpenseReportResponseDto> {
  const report = await this.findOneOrFail(reportId);
  if (report.status !== ExpenseReportStatus.CREATED) {
    throw new BadRequestException('Only CREATED reports can be submitted');
  }
  // Transaction
  await this.dataSource.transaction(async (manager) => {
    await manager.update(ExpenseReport, reportId, {
      status: ExpenseReportStatus.SUBMITTED,
      submittedAt: new Date().toISOString(),
    });
    await manager.update(
      Expense,
      { expenseReportId: reportId },
      { status: ExpenseStatus.SUBMITTED }
    );
  });
  return this.findOne(reportId);
}
```

---

### 7.2 Expense Service

| Règle | Implémentation |
|-------|----------------|
| Création uniquement si report `CREATED` ou `SUBMITTED` | Vérifier `report.status` en début de `create()` → `ForbiddenException` sinon |
| `expenseDate` par défaut = `expenseReport.reportDate`, sinon date du jour | Si `expenseDate` absent du DTO → `expenseDate = report.reportDate ?? new Date().toISOString().split('T')[0]` |
| `status = CREATED` à la création | Forcer dans `create()` |
| Modification interdite si report `VALIDATED`/`DENIED` OU si expense `ACCEPTED`/`DENIED` | Double garde au début de `update()` |
| Suppression cascade attachments | TypeORM cascade `remove` sur relation `attachments` |
| **Recalcul `totalAmount`** du report parent à chaque create/update/delete | Appeler `recalculateReportTotal(reportId)` après chaque mutation |

**Méthode recalcul — pseudocode :**
```typescript
private async recalculateReportTotal(reportId: string): Promise<void> {
  const result = await this.expenseRepo
    .createQueryBuilder('e')
    .select('SUM(e.amount)', 'total')
    .where('e.expenseReportId = :reportId', { reportId })
    .getRawOne<{ total: string | null }>();

  const total = parseFloat(result?.total ?? '0') || 0;
  await this.reportRepo.update(reportId, { totalAmount: total });
}
```

---

### 7.3 ExpenseAttachment Service

| Règle | Implémentation |
|-------|----------------|
| Validation MIME : uniquement `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf` | Filtre dans `multer` (fileFilter) + double vérification dans le service |
| Taille max : 50 MB | `limits: { fileSize: 50 * 1024 * 1024 }` dans multer config |
| Nom fichier stocké : UUID + extension originale | `fileName = uuid() + path.extname(file.originalname).toLowerCase()` |
| URL publique : `/uploads/<fileName>` | `url = '/uploads/' + fileName` |
| `storagePath` : chemin absolu vers le fichier sur disque | `path.join(process.cwd(), 'uploads', fileName)` |
| Suppression : suppression physique (`fs.unlink`) + suppression BDD | Transaction : `fs.unlinkSync(storagePath)` puis `repo.delete(id)` |
| Vérifier existence expense avant tout upload | `findOneOrFail(expenseId)` avec vérification `expenseId === expense.id && expense.expenseReportId === reportId` |

---

## 8. Configuration uploads

### 8.1 Factory Multer

**Fichier :** `backend/src/expense-attachments/multer/multer-config.factory.ts`

```typescript
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const multerDiskStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${ext}`;
    cb(null, fileName);
  },
});

export const multerFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};
```

### 8.2 Exposition statique

Dans `main.ts` — utiliser `ServeStaticModule` dans `AppModule` pour exposer le dossier `uploads/` :

```typescript
// Dans AppModule.imports[]
ServeStaticModule.forRoot({
  rootPath: path.join(process.cwd(), 'uploads'),
  serveRoot: '/uploads',
  serveStaticOptions: {
    index: false,
    fallthrough: false,
  },
})
```

### 8.3 Initialisation du dossier `uploads/`

Dans `main.ts`, avant le bootstrap (pattern identique à `database.module.ts` pour `data/`) :

```typescript
import * as fs from 'fs';
import * as path from 'path';

const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
```

### 8.4 `.gitignore` — ajout

```gitignore
# Uploads
uploads/*
!uploads/.gitkeep
```

---

## 9. Variables d'environnement

### 9.1 Ajouts dans `backend/.env.example`

```dotenv
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_PATH=data/db.sqlite

# Expense uploads
APP_CURRENCY=EUR
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

| Variable | Défaut | Usage |
|----------|--------|-------|
| `APP_CURRENCY` | `EUR` | Devise d'affichage (informatif, stockage en nombre simple) |
| `UPLOAD_DIR` | `uploads` | Répertoire de stockage des fichiers (relatif à `process.cwd()`) |
| `MAX_FILE_SIZE` | `52428800` | Taille max en octets (50 MB = 50×1024×1024) |

---

## 10. Migrations TypeORM (référence structurelle)

> ⚠️ **Nota Bene :** Le driver `sqljs` avec `synchronize: true` gère le schéma automatiquement au démarrage. Ces migrations sont documentées à titre de **référence** pour comprendre les changesets et pour faciliter une future migration vers un driver SQLite natif (`better-sqlite3`) ou PostgreSQL.

### 10.1 `1712000000000-CreateExpenseReports.ts`

```typescript
export class CreateExpenseReports1712000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'expense_reports',
      columns: [
        { name: 'id', type: 'varchar', isPrimary: true, generationStrategy: 'uuid' },
        { name: 'purpose', type: 'varchar', length: '255' },
        { name: 'reportDate', type: 'date' },
        { name: 'status', type: 'varchar', default: "'CREATED'" },
        { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
        { name: 'submittedAt', type: 'datetime', isNullable: true, default: null },
        { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ],
      indices: [
        { columnNames: ['status'] },
        { columnNames: ['createdAt'] },
        { columnNames: ['reportDate'] },
      ],
    }), true);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('expense_reports');
  }
}
```

### 10.2 `1712000001000-CreateExpenses.ts`

```typescript
export class CreateExpenses1712000001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'expenses',
      columns: [
        { name: 'id', type: 'varchar', isPrimary: true, generationStrategy: 'uuid' },
        { name: 'expenseReportId', type: 'varchar' },
        { name: 'category', type: 'varchar' },
        { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
        { name: 'expenseName', type: 'varchar', length: '255' },
        { name: 'description', type: 'text', isNullable: true, default: null },
        { name: 'expenseDate', type: 'date' },
        { name: 'status', type: 'varchar', default: "'CREATED'" },
        { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ],
      foreignKeys: [{
        columnNames: ['expenseReportId'],
        referencedTableName: 'expense_reports',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }],
      indices: [
        { columnNames: ['expenseReportId'] },
        { columnNames: ['category'] },
        { columnNames: ['status'] },
      ],
    }), true);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('expenses');
  }
}
```

### 10.3 `1712000002000-CreateExpenseAttachments.ts`

```typescript
export class CreateExpenseAttachments1712000002000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'expense_attachments',
      columns: [
        { name: 'id', type: 'varchar', isPrimary: true, generationStrategy: 'uuid' },
        { name: 'expenseId', type: 'varchar' },
        { name: 'originalName', type: 'varchar', length: '255' },
        { name: 'fileName', type: 'varchar', length: '255' },
        { name: 'mimeType', type: 'varchar', length: '100' },
        { name: 'size', type: 'int' },
        { name: 'extension', type: 'varchar', length: '20' },
        { name: 'storagePath', type: 'varchar', length: '500' },
        { name: 'url', type: 'varchar', length: '500' },
        { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ],
      foreignKeys: [{
        columnNames: ['expenseId'],
        referencedTableName: 'expenses',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }],
      indices: [
        { columnNames: ['expenseId'] },
      ],
    }), true);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('expense_attachments');
  }
}
```

---

## 11. Seeds de démonstration

**Fichier :** `backend/src/database/seeds/expense-reports.seed.ts`

### Plan des données de seed

**Report 1 — Voyage commercial Lyon** (status: `VALIDATED`)
- Expenses :
  - `TRAVEL` : Billet TGV Paris-Lyon — 89,00 €
  - `HOTEL` : Hôtel Mercure Lyon — 145,00 €
  - `RESTAURANT` : Déjeuner client — 67,50 €
- Total : 301,50 €

**Report 2 — Conférence Web Summit** (status: `SUBMITTED`)
- Expenses :
  - `TRAVEL` : Vol Paris-Lisbonne — 324,00 €
  - `HOTEL` : Hotel Lisboa — 412,00 €
  - `RESTAURANT` : Dîner d'équipe — 156,20 €
  - `TRANSPORT` : Taxi aéroport — 45,00 €
- Total : 937,20 €

**Report 3 — Fournitures bureau Q1** (status: `CREATED`)
- Expenses :
  - `OFFICE_SUPPLIES` : Papier et stylos — 34,90 €
  - `OFFICE_SUPPLIES` : Cartouches imprimante — 89,99 €
  - `OTHER` : Frais divers — 12,50 €
- Total : 137,39 €

**Report 4 — Team Building Printemps** (status: `DENIED`)
- Expenses :
  - `TEAM_EVENT` : Karting équipe — 380,00 €
  - `RESTAURANT` : Repas post-activité — 245,00 €
  - `TRANSPORT` : Location minibus — 180,00 €
- Total : 805,00 €

**Règles d'implémentation du seed :**
- Utiliser `TypeOrmModule` + `DataSource` injectable
- Insérer dans l'ordre : reports → expenses (pas d'attachments)
- Vérifier que les tables sont vides avant insertion (`count === 0`)
- Utiliser des UUID déterministes pour la reproductibilité (`v5` ou constantes)
- Le script seed est lancé via `ts-node` : `npx ts-node src/database/seeds/expense-reports.seed.ts`

---

## 12. Modifications des fichiers existants

### 12.1 `backend/src/app.module.ts`

**Ajouts dans `imports[]` :**

```typescript
import { Module } from '@nestjs/common';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ExpenseReportsModule } from './expense-reports/expense-reports.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseAttachmentsModule } from './expense-attachments/expense-attachments.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false, fallthrough: false },
    }),
    ExpenseReportsModule,
    ExpensesModule,
    ExpenseAttachmentsModule,
  ],
})
export class AppModule {}
```

### 12.2 `backend/src/main.ts`

**Modifications :**
1. Ajouter `fs.mkdirSync` pour le répertoire `uploads/`
2. Ajouter `ValidationPipe` global
3. Mettre à jour le titre Swagger

```typescript
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Créer le répertoire uploads si absent (pattern identique à database.module.ts)
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Validation globale de tous les DTOs entrants
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,       // transforme les types (string → number pour @Type(() => Number))
      whitelist: true,       // supprime les champs non décorés
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Expense Management API')
    .setDescription('API de gestion des notes de frais')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 12.3 `backend/.env.example`

```dotenv
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_PATH=data/db.sqlite

# Expense management
APP_CURRENCY=EUR
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

---

## 13. Détail des DTOs clés

### 13.1 `CreateExpenseReportDto`

```typescript
// create-expense-report.dto.ts
export class CreateExpenseReportDto {
  @ApiProperty({ example: 'Voyage commercial Lyon', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  purpose: string;

  @ApiProperty({ example: '2026-04-01', description: 'Format YYYY-MM-DD' })
  @IsDateString()
  reportDate: string;
}
```

> Le `status`, `totalAmount`, `submittedAt` sont **exclus** — fixés par le service.

### 13.2 `UpdateExpenseReportDto`

```typescript
// update-expense-report.dto.ts
export class UpdateExpenseReportDto extends PartialType(CreateExpenseReportDto) {}
// Identique à CreateExpenseReportDto mais tous les champs optionnels
// PUT utilise ce même DTO mais avec @IsNotEmpty() implicite via le service
```

### 13.3 `CreateExpenseDto`

```typescript
export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 89.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'Billet TGV Paris-Lyon', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  expenseName: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-04-01', required: false })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;
  // Si absent → défaut expenseReport.reportDate ou date du jour (géré par service)
}
```

### 13.4 `ExpenseReportResponseDto`

```typescript
export class ExpenseReportResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() purpose: string;
  @ApiProperty() reportDate: string;
  @ApiProperty({ enum: ExpenseReportStatus }) status: ExpenseReportStatus;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ nullable: true }) submittedAt: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: () => [ExpenseResponseDto], required: false })
  expenses?: ExpenseResponseDto[];
}
```

---

## 14. Structure des modules NestJS

### 14.1 `ExpenseReportsModule`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ExpenseReport])],
  controllers: [ExpenseReportsController],
  providers: [ExpenseReportsService],
  exports: [ExpenseReportsService],   // exporté pour usage dans ExpensesService
})
export class ExpenseReportsModule {}
```

### 14.2 `ExpensesModule`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseReport]),
    // ExpenseReport repo requis pour validation status + recalcul totalAmount
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
```

### 14.3 `ExpenseAttachmentsModule`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseAttachment, Expense]),
  ],
  controllers: [ExpenseAttachmentsController],
  providers: [ExpenseAttachmentsService],
})
export class ExpenseAttachmentsModule {}
```

---

## 15. Gestion des erreurs

| Situation | Exception NestJS |
|-----------|-----------------|
| Report/Expense/Attachment introuvable | `NotFoundException` (`404`) |
| Modification interdite (status) | `ForbiddenException` (`403`) |
| Submit impossible (mauvais status) | `BadRequestException` (`400`) |
| Type MIME non autorisé | `BadRequestException` (`400`) |
| Fichier trop volumineux | Multer lance `PayloadTooLargeException` → intercepter dans filtre global |
| Validation DTO échouée | `ValidationPipe` lance automatiquement `BadRequestException` (`400`) |
| Erreur suppression fichier physique | Logger l'erreur, ne pas bloquer la suppression BDD |

---

## 16. Checklist d'implémentation (ordre recommandé)

```
[ ] 1. Installer les packages manquants (class-validator, class-transformer, uuid, @nestjs/serve-static, @types/multer, @types/uuid)
[ ] 2. Créer les 3 enums dans common/enums/
[ ] 3. Créer les 3 entités TypeORM (expense-report, expense, expense-attachment)
[ ] 4. Créer la multer-config.factory.ts
[ ] 5. Créer les DTOs (create, update, response, query) pour chaque module
[ ] 6. Créer ExpenseReportsService + ExpenseReportsController + ExpenseReportsModule
[ ] 7. Créer ExpensesService + ExpensesController + ExpensesModule
[ ] 8. Créer ExpenseAttachmentsService + ExpenseAttachmentsController + ExpenseAttachmentsModule
[ ] 9. Modifier app.module.ts (imports ServeStaticModule + 3 nouveaux modules)
[ ] 10. Modifier main.ts (uploads dir init + ValidationPipe + Swagger title)
[ ] 11. Mettre à jour .env.example
[ ] 12. Créer uploads/.gitkeep + mettre à jour .gitignore
[ ] 13. Créer les fichiers de migration (référence documentaire)
[ ] 14. Créer le script de seed
[ ] 15. Tester l'ensemble via Swagger UI sur /api/docs
```
