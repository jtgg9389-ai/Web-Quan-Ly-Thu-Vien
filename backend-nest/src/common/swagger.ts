import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

// Khai báo các query tùy chọn cho Swagger
export const Queries = (...names: string[]) =>
  applyDecorators(...names.map((name) => ApiQuery({ name, required: false })));
