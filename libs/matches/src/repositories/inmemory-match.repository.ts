import { MatchEntity } from '@matches/domain/match.entity';
import { MatchRepository } from '@matches/domain/match.repository';
import { Optional } from '@shared/optional';

export class InMemoryMatchRepository implements MatchRepository {
  private readonly matchesById: Map<string, MatchEntity> = new Map();

  async getById(matchId: string): Promise<Optional<MatchEntity>> {
    return Optional.of(this.matchesById.get(matchId));
  }

  async save(match: MatchEntity): Promise<void> {
    this.matchesById.set(match.id, match);
  }
}
