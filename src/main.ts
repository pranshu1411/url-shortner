import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedingService } from './seeding/seeding.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const seedingService = app.get(SeedingService);
  await seedingService.seedRanges();
  await app.listen(3000);
}
bootstrap();
