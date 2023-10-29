import { Module } from '@nestjs/common';
import { FifaTiseAgentController } from './fifa-tise-agent.controller';
import { FifaTiseAgentService } from './fifa-tise-agent.service';

@Module({
  imports: [],
  controllers: [FifaTiseAgentController],
  providers: [FifaTiseAgentService],
})
export class FifaTiseAgentModule {}
