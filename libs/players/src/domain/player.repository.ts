import { Optional } from '@shared/optional';
import { PlayerEntity } from './player.entity';

export abstract class PlayerRepository {
  abstract exists(email: string): Promise<boolean>;
  abstract getById(id: string): Promise<Optional<PlayerEntity>>;
  abstract save(player: PlayerEntity): Promise<void>;
  abstract findByNameOrEmail(nameOrEmail: string[]): Promise<PlayerEntity[]>;
}
