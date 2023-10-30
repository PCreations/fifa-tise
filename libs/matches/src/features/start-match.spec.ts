import {
  MatchEntity,
  MatchState,
  StarRating,
} from '@matches/domain/match.entity';
import { InMemoryMatchRepository } from '@matches/repositories/inmemory-match.repository';
import { StartMatch } from './start-match';
import { InMemoryBuddiesGroupRepository } from '@players/repositories/inmemory-buddies-group.repository';
import { BuddiesGroupEntity } from '@players/domain/buddies-group.entity';

describe('Feature: starting a match', () => {
  it('should start a match given two teams and two players', async () => {
    const matchRepository = new InMemoryMatchRepository();
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const startMatch = new StartMatch(matchRepository, buddiesGroupRepository);
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id', 'pierre-id']),
      }),
    );

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

  it('should throws an error if the players are not in the same buddies group', async () => {
    const matchRepository = new InMemoryMatchRepository();
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const startMatch = new StartMatch(matchRepository, buddiesGroupRepository);
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id']),
      }),
    );

    await expect(() =>
      startMatch.execute({
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
      }),
    ).rejects.toThrowError(
      new Error(
        'Players are not in the same buddies group thus cannot play against each other. You first need to create a buddies group and add both players to it.',
      ),
    );
  });

  it('should throws an error if the players are already in a match', async () => {
    const matchRepository = new InMemoryMatchRepository();
    await matchRepository.save(
      MatchEntity.between({
        id: 'some-match-id',
        home: {
          player: 'antho-id',
          name: 'Liverpool',
          stars: 5,
        },
        away: {
          player: 'pierre-id',
          name: 'OL',
          stars: 4.5,
        },
      }),
    );
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const startMatch = new StartMatch(matchRepository, buddiesGroupRepository);
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id', 'pierre-id']),
      }),
    );

    await expect(() =>
      startMatch.execute({
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
      }),
    ).rejects.toThrowError(
      new Error(
        'There is already a started match between these players.: {"id":"some-match-id","home":{"player":"antho-id","name":"Liverpool","stars":5,"score":0},"away":{"player":"pierre-id","name":"OL","stars":4.5,"score":0},"state":"started"}',
      ),
    );
  });
});
