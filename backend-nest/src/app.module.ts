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
<<<<<<< HEAD
import { PasswordResetModule } from './password-reset/password-reset.module';
=======
>>>>>>> b87cac6dd30c98b70e4b7a9d9940984bb3298348

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
<<<<<<< HEAD
    PasswordResetModule, // [THÊM MỚI]
=======
>>>>>>> b87cac6dd30c98b70e4b7a9d9940984bb3298348
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
<<<<<<< HEAD
export class AppModule {}
=======
export class AppModule {}
>>>>>>> b87cac6dd30c98b70e4b7a9d9940984bb3298348
