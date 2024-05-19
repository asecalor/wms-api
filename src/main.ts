import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Port 3000 is used in control tower
  await app.listen(3001);
}
bootstrap();
