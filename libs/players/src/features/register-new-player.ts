import { Injectable } from '@nestjs/common';
import { PlayerRepository } from '../domain/player.repository';
import { PlayerEntity } from '../domain/player.entity';

type RegisterCommand = {
  id: string;
  email: string;
  name: string;
};

@Injectable()
export class RegisterNewPlayer {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(registerCommand: RegisterCommand) {
    const playerExists = await this.playerRepository.exists(
      registerCommand.email,
    );
    if (playerExists) {
      return;
    }
    const player = new PlayerEntity({
      id: registerCommand.id,
      email: registerCommand.email,
      name: registerCommand.name,
    });

    await this.playerRepository.save(player);
  }
}
