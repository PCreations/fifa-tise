import { Test, TestingModule } from '@nestjs/testing';
import { FifaTiseAgentController } from './fifa-tise-agent.controller';
import { FifaTiseAgentService } from './fifa-tise-agent.service';

describe('FifaTiseAgentController', () => {
  let fifaTiseAgentController: FifaTiseAgentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FifaTiseAgentController],
      providers: [FifaTiseAgentService],
    }).compile();

    fifaTiseAgentController = app.get<FifaTiseAgentController>(FifaTiseAgentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fifaTiseAgentController.getHello()).toBe('Hello World!');
    });
  });
});
