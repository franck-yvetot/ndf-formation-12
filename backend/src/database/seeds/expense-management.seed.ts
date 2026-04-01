/**
 * Expense Management Demo Seeds
 *
 * Uses a direct TypeORM DataSource (sqljs) — no NestJS bootstrap required.
 * Run with: npm run seed  (from the backend/ directory)
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ExpenseReport } from '../../expense-reports/entities/expense-report.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseAttachment } from '../../expense-attachments/entities/expense-attachment.entity';
import { ExpenseReportStatus } from '../../common/enums/expense-report-status.enum';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';

const dbPath = process.env['DB_PATH'] ?? 'data/db.sqlite';

const dataSource = new DataSource({
  type: 'sqljs',
  location: dbPath,
  autoSave: true,
  synchronize: true,
  entities: [ExpenseReport, Expense, ExpenseAttachment],
  logging: false,
});

async function seed(): Promise<void> {
  console.log('🌱 Connecting to database at:', dbPath);
  await dataSource.initialize();

  const reportRepo = dataSource.getRepository(ExpenseReport);
  const expenseRepo = dataSource.getRepository(Expense);

  // --- Idempotent cleanup ---
  console.log('🧹 Clearing existing expense data...');
  await expenseRepo.delete({});
  await reportRepo.delete({});

  // === Report 1 — CREATED ===
  const report1Id = uuidv4();
  await reportRepo.save(
    reportRepo.create({
      id: report1Id,
      purpose: 'Déplacement commercial Paris — Client ABC',
      reportDate: '2024-01-15',
      status: ExpenseReportStatus.CREATED,
      totalAmount: 320.30,
      submittedAt: null,
    }),
  );

  await expenseRepo.save([
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report1Id,
      category: ExpenseCategory.TRANSPORT,
      amount: 85.50,
      expenseName: 'Billet TGV Paris-Lyon',
      description: null,
      expenseDate: '2024-01-15',
      status: ExpenseStatus.CREATED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report1Id,
      category: ExpenseCategory.HOTEL,
      amount: 189.00,
      expenseName: 'Hôtel Mercure Lyon Centre',
      description: null,
      expenseDate: '2024-01-15',
      status: ExpenseStatus.CREATED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report1Id,
      category: ExpenseCategory.RESTAURANT,
      amount: 45.80,
      expenseName: 'Dîner équipe client',
      description: null,
      expenseDate: '2024-01-15',
      status: ExpenseStatus.CREATED,
    }),
  ]);

  // === Report 2 — SUBMITTED ===
  const report2Id = uuidv4();
  await reportRepo.save(
    reportRepo.create({
      id: report2Id,
      purpose: 'Formation NestJS avancé — Lyon',
      reportDate: '2024-01-08',
      status: ExpenseReportStatus.SUBMITTED,
      totalAmount: 525.99,
      submittedAt: '2024-01-10T00:00:00.000Z',
    }),
  );

  await expenseRepo.save([
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report2Id,
      category: ExpenseCategory.TRANSPORT,
      amount: 120.00,
      expenseName: 'Vol Paris-Lyon aller',
      description: null,
      expenseDate: '2024-01-08',
      status: ExpenseStatus.SUBMITTED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report2Id,
      category: ExpenseCategory.TRANSPORT,
      amount: 120.00,
      expenseName: 'Vol Lyon-Paris retour',
      description: null,
      expenseDate: '2024-01-09',
      status: ExpenseStatus.SUBMITTED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report2Id,
      category: ExpenseCategory.HOTEL,
      amount: 250.00,
      expenseName: 'Hôtel formation 2 nuits',
      description: null,
      expenseDate: '2024-01-08',
      status: ExpenseStatus.SUBMITTED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report2Id,
      category: ExpenseCategory.OFFICE_SUPPLIES,
      amount: 35.99,
      expenseName: 'Livres et supports formation',
      description: null,
      expenseDate: '2024-01-08',
      status: ExpenseStatus.SUBMITTED,
    }),
  ]);

  // === Report 3 — VALIDATED ===
  const report3Id = uuidv4();
  await reportRepo.save(
    reportRepo.create({
      id: report3Id,
      purpose: 'Team building Q4 2023',
      reportDate: '2023-12-15',
      status: ExpenseReportStatus.VALIDATED,
      totalAmount: 2000.00,
      submittedAt: '2023-12-18T00:00:00.000Z',
    }),
  );

  await expenseRepo.save([
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report3Id,
      category: ExpenseCategory.TEAM_EVENT,
      amount: 1500.00,
      expenseName: 'Location salle team building',
      description: null,
      expenseDate: '2023-12-15',
      status: ExpenseStatus.ACCEPTED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report3Id,
      category: ExpenseCategory.RESTAURANT,
      amount: 320.00,
      expenseName: 'Repas équipe team building',
      description: null,
      expenseDate: '2023-12-15',
      status: ExpenseStatus.ACCEPTED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report3Id,
      category: ExpenseCategory.TRANSPORT,
      amount: 180.00,
      expenseName: 'Transport collectif équipe',
      description: null,
      expenseDate: '2023-12-15',
      status: ExpenseStatus.ACCEPTED,
    }),
  ]);

  // === Report 4 — DENIED ===
  const report4Id = uuidv4();
  await reportRepo.save(
    reportRepo.create({
      id: report4Id,
      purpose: 'Déplacement salon technologique Berlin',
      reportDate: '2024-02-01',
      status: ExpenseReportStatus.DENIED,
      totalAmount: 1300.00,
      submittedAt: '2024-02-05T00:00:00.000Z',
    }),
  );

  await expenseRepo.save([
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report4Id,
      category: ExpenseCategory.TRAVEL,
      amount: 850.00,
      expenseName: 'Vol Paris-Berlin',
      description: null,
      expenseDate: '2024-02-01',
      status: ExpenseStatus.DENIED,
    }),
    expenseRepo.create({
      id: uuidv4(),
      expenseReportId: report4Id,
      category: ExpenseCategory.HOTEL,
      amount: 450.00,
      expenseName: 'Hôtel Berlin 3 nuits',
      description: null,
      expenseDate: '2024-02-01',
      status: ExpenseStatus.DENIED,
    }),
  ]);

  await dataSource.destroy();
  console.log('✅ Seeds inserted successfully!');
  console.log('   → 4 expense reports');
  console.log('   → 12 expenses (3 + 4 + 3 + 2)');
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
