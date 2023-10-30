import { Injectable } from '@nestjs/common';
import { BuddiesGroupRepository } from '../domain/buddies-group.repository';

@Injectable()
export class GetPlayerBuddiesGroups {
  constructor(
    private readonly buddiesGroupRepository: BuddiesGroupRepository,
  ) {}

  async execute(playerId: string) {
    return this.buddiesGroupRepository.findAllWherePlayerIsIn(playerId);
  }
}
