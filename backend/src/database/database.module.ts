import * as fs from 'fs';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const dbPath = process.env['DB_PATH'] ?? 'data/db.sqlite';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: dbPath,
      autoSave: true,
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
