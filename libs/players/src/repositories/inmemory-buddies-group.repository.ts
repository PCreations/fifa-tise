import { Optional } from '@shared/optional';
import { BuddiesGroupEntity } from '../domain/buddies-group.entity';
import { BuddiesGroupRepository } from '../domain/buddies-group.repository';
import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';

@Injectable()
export class InMemoryBuddiesGroupRepository implements BuddiesGroupRepository {
  readonly buddiesGroupsById = new Map<string, BuddiesGroupEntity>();

  async getById(id: string) {
    return Optional.of(this.buddiesGroupsById.get(id));
  }

  async save(buddiesGroup: BuddiesGroupEntity) {
    this.buddiesGroupsById.set(buddiesGroup.id, buddiesGroup);
    await writeFile(
      'buddies-groups.json',
      JSON.stringify(
        Object.fromEntries(
          [...this.buddiesGroupsById.entries()].map(([id, buddiesGroup]) => [
            id,
            buddiesGroup.takeSnapshot(),
          ]),
        ),
      ),
    );
  }

  async findAllWherePlayerIsIn(
    playerId: string,
  ): Promise<BuddiesGroupEntity[]> {
    return Array.from(this.buddiesGroupsById.values()).filter((buddiesGroup) =>
      buddiesGroup.hasPlayer(playerId),
    );
  }

  async arePlayersInSameBuddiesGroup(
    player1id: string,
    player2id: string,
  ): Promise<boolean> {
    const buddiesGroups = await this.findAllWherePlayerIsIn(player1id);
    return buddiesGroups.some((buddiesGroup) =>
      buddiesGroup.hasPlayer(player2id),
    );
  }
}
