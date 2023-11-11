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

    return match.getOrThrow(
      new Error(
        `No match found for player with uuid ${currentMatchQuery.playerId}`,
      ),
    );
  }
}
