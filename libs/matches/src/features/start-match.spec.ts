import {
  MatchEntity,
  MatchState,
  StarRating,
} from '@matches/domain/match.entity';
import { InMemoryMatchRepository } from '@matches/repositories/inmemory-match.repository';
import { StartMatch } from './start-match';

describe('Feature: starting a match', () => {
  it('should start a match given two teams and two players', async () => {
    const matchRepository = new InMemoryMatchRepository();
    const startMatch = new StartMatch(matchRepository);

    await startMatch.execute({
      matchId: 'match-id',
      homeTeam: {
        player: 'antho-id',
        name: 'Liverpool',
        stars: 5,
      },
      awayTeam: {
        player: 'pierre-id',
        name: 'OL',
        stars: 4.5,
      },
    });

    const startedMatch = await matchRepository.getById('match-id');
    expect(startedMatch.getOrThrow()).toEqual(
      new MatchEntity({
        id: 'match-id',
        state: MatchState.STARTED,
        home: {
          player: 'antho-id',
          name: 'Liverpool',
          stars: StarRating.FIVE,
          score: 0,
        },
        away: {
          player: 'pierre-id',
          name: 'OL',
          stars: StarRating.FOUR_AND_HALF,
          score: 0,
        },
      }),
    );
  });
});
