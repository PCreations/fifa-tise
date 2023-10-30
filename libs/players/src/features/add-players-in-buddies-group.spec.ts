import { BuddiesGroupEntity } from '../domain/buddies-group.entity';
import { PlayerEntity } from '../domain/player.entity';
import { InMemoryBuddiesGroupRepository } from '../repositories/inmemory-buddies-group.repository';
import { InMemoryPlayerRepository } from '../repositories/inmemory-player.repository';
import { AddPlayersInBuddiesGroup } from './add-players-in-buddies-group';

describe('Feature: adding players in buddies group', () => {
  test('Example: Adding existing players in existing buddies group', async () => {
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const playerRepository = new InMemoryPlayerRepository();
    const addPlayersInBuddiesGroup = new AddPlayersInBuddiesGroup(
      playerRepository,
      buddiesGroupRepository,
    );
    await playerRepository.save(
      new PlayerEntity({
        id: 'antho-id',
        name: 'antho',
        email: 'antho@gmail.com',
      }),
    );
    await playerRepository.save(
      new PlayerEntity({
        id: 'pierre-id',
        name: 'pierre',
        email: 'pierre@gmail.com',
      }),
    );
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set([]),
      }),
    );

    const result = await addPlayersInBuddiesGroup.execute({
      buddiesGroupId: 'buddies-group-id',
      players: ['antho-id', 'pierre-id'],
    });

    const buddiesGroup =
      await buddiesGroupRepository.getById('buddies-group-id');
    expect(buddiesGroup.getOrThrow()).toEqual(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id', 'pierre-id']),
      }),
    );
    expect(result).toEqual({
      created: false,
      notFoundPlayers: [],
    });
  });

  test('Example: Adding some existing players in non existing buddies group', async () => {
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const playerRepository = new InMemoryPlayerRepository();
    const addPlayersInBuddiesGroup = new AddPlayersInBuddiesGroup(
      playerRepository,
      buddiesGroupRepository,
    );
    await playerRepository.save(
      new PlayerEntity({
        id: 'antho-id',
        name: 'antho',
        email: 'antho@gmail.com',
      }),
    );
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set([]),
      }),
    );

    const result = await addPlayersInBuddiesGroup.execute({
      buddiesGroupId: 'buddies-group-id',
      players: ['antho-id', 'pierre-id'],
    });

    const buddiesGroup =
      await buddiesGroupRepository.getById('buddies-group-id');

    expect(buddiesGroup.getOrThrow()).toEqual(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id']),
      }),
    );
    expect(result).toEqual({
      created: false,
      notFoundPlayers: ['pierre-id'],
    });
  });

  test('Example: Adding some existing players in existing buddies group', async () => {
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const playerRepository = new InMemoryPlayerRepository();
    const addPlayersInBuddiesGroup = new AddPlayersInBuddiesGroup(
      playerRepository,
      buddiesGroupRepository,
    );
    await playerRepository.save(
      new PlayerEntity({
        id: 'antho-id',
        name: 'antho',
        email: 'antho@gmail.com',
      }),
    );

    const result = await addPlayersInBuddiesGroup.execute({
      buddiesGroupId: 'buddies-group-id',
      players: ['antho-id', 'pierre-id'],
    });

    const buddiesGroup =
      await buddiesGroupRepository.getById('buddies-group-id');

    expect(buddiesGroup.getOrThrow()).toEqual(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id']),
      }),
    );
    expect(result).toEqual({
      created: true,
      notFoundPlayers: ['pierre-id'],
    });
  });

  test('Example: Adding existing players in non existing buddies group', async () => {
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const playerRepository = new InMemoryPlayerRepository();
    const addPlayersInBuddiesGroup = new AddPlayersInBuddiesGroup(
      playerRepository,
      buddiesGroupRepository,
    );
    await playerRepository.save(
      new PlayerEntity({
        id: 'antho-id',
        name: 'antho',
        email: 'antho@gmail.com',
      }),
    );
    await playerRepository.save(
      new PlayerEntity({
        id: 'pierre-id',
        name: 'pierre',
        email: 'pierre@gmail.com',
      }),
    );

    const result = await addPlayersInBuddiesGroup.execute({
      buddiesGroupId: 'buddies-group-id',
      players: ['antho-id', 'pierre-id'],
    });

    const buddiesGroup =
      await buddiesGroupRepository.getById('buddies-group-id');

    expect(buddiesGroup.getOrThrow()).toEqual(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id', 'pierre-id']),
      }),
    );
    expect(result).toEqual({
      created: true,
      notFoundPlayers: [],
    });
  });
});
