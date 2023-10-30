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

  hasPlayer(playerId: string) {
    return this.props.players.has(playerId);
  }

  addPlayers(players: PlayerEntity[]) {
    players.forEach((player) => this.props.players.add(player.id));
  }
}
