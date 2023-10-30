import { Injectable } from '@nestjs/common';
import { BuddiesGroupEntity } from '../domain/buddies-group.entity';
import { BuddiesGroupRepository } from '../domain/buddies-group.repository';

type CreateBuddiesGroupCommand = {
  id: string;
  players: string[];
};

@Injectable()
export class CreateBuddiesGroup {
  constructor(
    private readonly buddiesGroupRepository: BuddiesGroupRepository,
  ) {}

  async execute(createBuddiesGroupCommand: CreateBuddiesGroupCommand) {
    const buddiesGroup = new BuddiesGroupEntity({
      id: createBuddiesGroupCommand.id,
      players: new Set(createBuddiesGroupCommand.players),
    });

    return this.buddiesGroupRepository.save(buddiesGroup);
  }
}
