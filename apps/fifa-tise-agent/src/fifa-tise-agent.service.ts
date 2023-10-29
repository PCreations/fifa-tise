import { Injectable } from '@nestjs/common';

@Injectable()
export class FifaTiseAgentService {
  getHello(): string {
    return 'Hello World!';
  }
}
