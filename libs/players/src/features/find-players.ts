import { Injectable } from '@nestjs/common';
import { PlayerRepository } from '../domain/player.repository';

export type FindPlayersQuery = {
  nameOrEmail: string[];
};

@Injectable()
export class FindPlayers {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(findPlayersQuery: FindPlayersQuery) {
    return this.playerRepository.findByNameOrEmail(
      findPlayersQuery.nameOrEmail,
    );
  }
}
