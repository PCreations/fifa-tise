import { MatchEntity } from '@matches/domain/match.entity';
import { MatchRepository } from '@matches/domain/match.repository';
import { Injectable } from '@nestjs/common';

type StartMatchCommand = {
  matchId: string;
  homeTeam: {
    player: string;
    name: string;
    stars: number;
  };
  awayTeam: {
    player: string;
    name: string;
    stars: number;
  };
};

@Injectable()
export class StartMatch {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(startMatchCommand: StartMatchCommand) {
    const match = MatchEntity.between({
      id: startMatchCommand.matchId,
      home: startMatchCommand.homeTeam,
      away: startMatchCommand.awayTeam,
    });

    return this.matchRepository.save(match);
  }
}
