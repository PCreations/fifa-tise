import { Optional } from '@shared/optional';
import { PlayerEntity } from '../domain/player.entity';
import { PlayerRepository } from '../domain/player.repository';

export class InMemoryPlayerRepository implements PlayerRepository {
  readonly playersById = new Map<string, PlayerEntity>();
  readonly playersByEmail = new Map<string, PlayerEntity>();
  readonly playersByName = new Map<string, PlayerEntity>();

  async exists(email: string): Promise<boolean> {
    return this.playersByEmail.has(email);
  }

  async getById(id: string): Promise<Optional<PlayerEntity>> {
    const player = this.playersById.get(id);
    return Optional.of(player);
  }

  async save(player: PlayerEntity): Promise<void> {
    this.playersById.set(player.id, player);
    this.playersByEmail.set(player.email, player);
    this.playersByName.set(player.name, player);
  }

  async findByNameOrEmail(nameOrEmail: string[]): Promise<PlayerEntity[]> {
    return nameOrEmail
      .map((nameOrEmail) => {
        const player = this.playersByEmail.get(nameOrEmail);
        if (player) {
          return player;
        }
        return this.playersByName.get(nameOrEmail);
      })
      .filter((player) => player !== undefined) as PlayerEntity[];
  }
}
