import { MatchEntity } from '@matches/domain/match.entity';
import { MatchRepository } from '@matches/domain/match.repository';
import { Optional } from '@shared/optional';
import { writeFile } from 'fs/promises';

export class InMemoryMatchRepository implements MatchRepository {
  private readonly matchesById: Map<string, MatchEntity> = new Map();

  async getById(matchId: string): Promise<Optional<MatchEntity>> {
    return Optional.of(this.matchesById.get(matchId));
  }

  async getCurrentMatchOf(playerId: string): Promise<Optional<MatchEntity>> {
    const matches = Array.from(this.matchesById.values());
    const maybeMatchSnapshot = Optional.of(
      matches
        .map((m) => m.takeSnapshot())
        .find(
          (matchSnapshot) =>
            matchSnapshot.state === 'started' &&
            (matchSnapshot.home.player === playerId ||
              matchSnapshot.away.player === playerId),
        ),
    );

    return maybeMatchSnapshot.map((matchSnapshot) =>
      MatchEntity.fromSnapshot(matchSnapshot),
    );
  }

  async save(match: MatchEntity): Promise<void> {
    this.matchesById.set(match.id, match);
    await writeFile(
      'matches.json',
      JSON.stringify(Object.fromEntries(this.matchesById.entries())),
    );
  }

  async findCurrentStartedGameBetweenPlayers(
    player1id: string,
    player2id: string,
  ): Promise<Optional<MatchEntity>> {
    const matches = Array.from(this.matchesById.values());
    const maybeMatchSnapshot = Optional.of(
      matches
        .map((m) => m.takeSnapshot())
        .find(
          (matchSnapshot) =>
            matchSnapshot.state === 'started' &&
            ((matchSnapshot.home.player === player1id &&
              matchSnapshot.away.player === player2id) ||
              (matchSnapshot.home.player === player2id &&
                matchSnapshot.away.player === player1id)),
        ),
    );

    return maybeMatchSnapshot.map((matchSnapshot) =>
      MatchEntity.fromSnapshot(matchSnapshot),
    );
  }
}
