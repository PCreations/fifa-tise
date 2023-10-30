import { MatchRepository } from '@matches/domain/match.repository';
import { Injectable } from '@nestjs/common';

type CurrentMatchQuery = {
  playerId: string;
};

@Injectable()
export class GetCurrentMatchOf {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(currentMatchQuery: CurrentMatchQuery) {
    const match = await this.matchRepository.getCurrentMatchOf(
      currentMatchQuery.playerId,
    );

    if (match.isNull()) {
      return 'No match found';
    }

    return match.get();
  }
}
