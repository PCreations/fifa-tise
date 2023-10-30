import { MatchRepository } from '@matches/domain/match.repository';
import { Injectable } from '@nestjs/common';

type EndMatchCommand = {
  matchId: string;
};

@Injectable()
export class EndMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(endMatchCommand: EndMatchCommand) {
    const match = await this.getMatch(endMatchCommand.matchId);

    const playerActions = match.endMatch();

    await this.matchRepository.save(match);

    return playerActions;
  }

  private async getMatch(matchId: string) {
    const maybeMatch = await this.matchRepository.getById(matchId);
    return maybeMatch.getOrThrow(new Error('Match not found'));
  }
}
