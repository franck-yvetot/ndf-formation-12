import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: process.env['DB_PATH'] ?? 'data/db.sqlite',
      autoSave: true,
      synchronize: true,
      autoLoadEntities: true,
      logging: false,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
