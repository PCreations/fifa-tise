import { NestFactory } from '@nestjs/core';
import { FifaTiseAgentModule } from './fifa-tise-agent.module';

async function bootstrap() {
  const app = await NestFactory.create(FifaTiseAgentModule);
  await app.listen(3000);
}
bootstrap();
