import { Module } from '@nestjs/common';
import { FifaTiseAgentService } from './fifa-tise-agent.service';
import { MatchesModule } from '@matches/matches.module';
import { PlayersModule } from '@players';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), MatchesModule, PlayersModule],
  providers: [FifaTiseAgentService],
})
export class FifaTiseAgentModule {}
