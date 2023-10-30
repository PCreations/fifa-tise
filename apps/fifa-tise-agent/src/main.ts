import { NestFactory } from '@nestjs/core';
import { FifaTiseAgentModule } from './fifa-tise-agent.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(FifaTiseAgentModule);
}
bootstrap();
