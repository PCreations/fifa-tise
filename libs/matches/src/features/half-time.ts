import { MatchRepository } from '@matches/domain/match.repository';
import { Injectable } from '@nestjs/common';

type HalfTimeCommand = {
  matchId: string;
};

@Injectable()
export class HalfTime {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(halftimeCommand: HalfTimeCommand) {
    const match = await this.getMatch(halftimeCommand.matchId);

    const playerActions = match.halfTime();

    await this.matchRepository.save(match);

    return playerActions;
  }

  private async getMatch(matchId: string) {
    const maybeMatch = await this.matchRepository.getById(matchId);
    return maybeMatch.getOrThrow(new Error('Match not found'));
  }
}
