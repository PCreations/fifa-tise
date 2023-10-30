import { Injectable } from '@nestjs/common';
import { PlayerRepository } from '../domain/player.repository';
import { BuddiesGroupRepository } from '../domain/buddies-group.repository';
import { BuddiesGroupEntity } from '../domain/buddies-group.entity';

type AddPlayersInBuddiesGroupCommand = {
  buddiesGroupId: string;
  players: string[];
};

export type AddPlayersInBuddiesGroupResult = {
  created: boolean;
  notFoundPlayers: string[];
};

@Injectable()
export class AddPlayersInBuddiesGroup {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly buddiesGroupRepository: BuddiesGroupRepository,
  ) {}

  async execute(
    addPlayersInBuddiesGroupCommand: AddPlayersInBuddiesGroupCommand,
  ) {
    const maybePlayers = await this.getPlayers(
      addPlayersInBuddiesGroupCommand.players,
    );
    const players = maybePlayers
      .filter((maybePlayer) => !maybePlayer.isNull())
      .map((maybePlayer) => maybePlayer.get());
    const notFoundPlayers = addPlayersInBuddiesGroupCommand.players.filter(
      (playerId) =>
        players.findIndex((player) => player.id === playerId) === -1,
    );

    const maybeBuddiesGroup = await this.buddiesGroupRepository.getById(
      addPlayersInBuddiesGroupCommand.buddiesGroupId,
    );
    if (maybeBuddiesGroup.isNull()) {
      const buddiesGroup = new BuddiesGroupEntity({
        id: addPlayersInBuddiesGroupCommand.buddiesGroupId,
        players: new Set(players.map((p) => p.id)),
      });
      await this.buddiesGroupRepository.save(buddiesGroup);
      return {
        created: true,
        notFoundPlayers,
      };
    }
    const buddiesGroup = maybeBuddiesGroup.get();
    buddiesGroup.addPlayers(players);

    await this.buddiesGroupRepository.save(buddiesGroup);

    return {
      created: false,
      notFoundPlayers,
    };
  }

  async getPlayers(playerIds: string[]) {
    return Promise.all(
      playerIds.map((playerId) => this.playerRepository.getById(playerId)),
    );
  }
}
