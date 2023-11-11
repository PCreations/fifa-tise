import { PlayerEntity } from './player.entity';

export class BuddiesGroupEntity {
  constructor(
    private readonly props: {
      id: string;
      players: Set<string>;
    },
  ) {}

  get id() {
    return this.props.id;
  }

  get players() {
    return this.props.players;
  }

  hasPlayer(playerId: string) {
    return this.props.players.has(playerId);
  }

  addPlayers(players: PlayerEntity[]) {
    players.forEach((player) => this.props.players.add(player.id));
  }

  takeSnapshot() {
    return {
      id: this.props.id,
      players: Array.from(this.props.players),
    };
  }
}
