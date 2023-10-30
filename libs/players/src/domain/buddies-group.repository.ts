import { Optional } from '@shared/optional';
import { BuddiesGroupEntity } from './buddies-group.entity';

export abstract class BuddiesGroupRepository {
  abstract getById(id: string): Promise<Optional<BuddiesGroupEntity>>;
  abstract findAllWherePlayerIsIn(
    playerId: string,
  ): Promise<BuddiesGroupEntity[]>;
  abstract save(buddiesGroup: BuddiesGroupEntity): Promise<void>;
  abstract arePlayersInSameBuddiesGroup(
    player1id: string,
    player2id: string,
  ): Promise<boolean>;
}
