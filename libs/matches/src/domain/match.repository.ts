import { Optional } from '@shared/optional';
import { MatchEntity } from './match.entity';

export abstract class MatchRepository {
  abstract getById(matchId: string): Promise<Optional<MatchEntity>>;
  abstract save(match: MatchEntity): Promise<void>;
}
