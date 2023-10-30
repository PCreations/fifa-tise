import { BuddiesGroupEntity } from '../domain/buddies-group.entity';
import { InMemoryBuddiesGroupRepository } from '../repositories/inmemory-buddies-group.repository';
import { CreateBuddiesGroup } from './create-buddies-group';

describe('Factory: create buddies group', () => {
  test('Example: Can create buddies group from existing players', async () => {
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const createBuddiesGroup = new CreateBuddiesGroup(buddiesGroupRepository);

    await createBuddiesGroup.execute({
      id: 'buddies-group-id',
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
  });
});
