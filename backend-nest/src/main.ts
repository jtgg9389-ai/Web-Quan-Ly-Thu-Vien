import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tắt body-parser mặc định (giới hạn 100kb) để nhận được ảnh bìa tải lên (data URL)
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '2mb' }), urlencoded({ extended: true, limit: '2mb' }));
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // credentials: true để trình duyệt gửi/nhận cookie refresh token
  app.enableCors({
    origin: process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*' ? process.env.CORS_ORIGIN : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger: http://localhost:3000/api-docs
  const doc = new DocumentBuilder()
    .setTitle('Quản lý thư viện API')
    .setDescription('Tài liệu API cho hệ thống quản lý thư viện. Đăng nhập rồi bấm **Authorize** và dán access token để thử các API.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, doc), {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API chạy tại http://localhost:${port}/api`);
  console.log(`📘 Swagger tại http://localhost:${port}/api-docs`);
}
bootstrap();
