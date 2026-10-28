import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { buildDbOptions } from './database/db.config';
import { LoansModule } from './loans/loans.module';
import { ReadersModule } from './readers/readers.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // DB_TYPE=sqlite (ở nhà) hoặc mysql (ở trường), đổi trong file .env
    TypeOrmModule.forRootAsync({ useFactory: () => buildDbOptions(process.env) as any }),
    AuthModule,
    SettingsModule,
    BooksModule,
    ReadersModule,
    LoansModule,
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
