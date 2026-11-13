import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { PasswordOtp } from './password-otp.entity';
import { PasswordResetController } from './password-reset.controller';
import { UserEntity } from './password-reset.config';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PasswordOtp]), JwtModule.register({})],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, MailService],
})
export class PasswordResetModule {}