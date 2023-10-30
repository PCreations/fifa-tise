import { Module } from '@nestjs/common';
import { StartMatch } from './features/start-match';
import { PlayersModule } from '@players';
import { HalfTime } from './features/half-time';
import { EndMatch } from './features/end-match';
import { MatchRepository } from './domain/match.repository';
import { InMemoryMatchRepository } from './repositories/inmemory-match.repository';
import { ScoreGoal } from './features/score-goal';
import { GetCurrentMatchOf } from './features/get-current-match';

@Module({
  imports: [PlayersModule],
  providers: [
    StartMatch,
    ScoreGoal,
    HalfTime,
    EndMatch,
    GetCurrentMatchOf,
    {
      provide: MatchRepository,
      useClass: InMemoryMatchRepository,
    },
  ],
  exports: [StartMatch, ScoreGoal, HalfTime, EndMatch, GetCurrentMatchOf],
})
export class MatchesModule {}
