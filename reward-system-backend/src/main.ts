import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT ?? 3000);
  // Bind explicitly so iOS simulator + other clients can reach it reliably.
  await app.listen(port, '0.0.0.0');
  // Helps verify the running build exposes staff routes (expect 401 without JWT, not 404).
  console.log(
    `Reward API listening on ${port} — admin dashboard: GET /admin/dashboard (requires Bearer token + users.manage)`,
  );
}
void bootstrap();
