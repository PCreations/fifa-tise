import { Controller, Get } from '@nestjs/common';
import { FifaTiseAgentService } from './fifa-tise-agent.service';

@Controller()
export class FifaTiseAgentController {
  constructor(private readonly fifaTiseAgentService: FifaTiseAgentService) {}

  @Get()
  getHello(): string {
    return this.fifaTiseAgentService.getHello();
  }
}
