import { BuddiesGroupRepository } from '@players/domain/buddies-group.repository';
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
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly buddiesGroupRepository: BuddiesGroupRepository,
  ) {}

  async execute(startMatchCommand: StartMatchCommand) {
    const arePlayersInTheSameBuddiesGroup =
      await this.buddiesGroupRepository.arePlayersInSameBuddiesGroup(
        startMatchCommand.homeTeam.player,
        startMatchCommand.awayTeam.player,
      );
    if (!arePlayersInTheSameBuddiesGroup) {
      throw new Error(
        'Players are not in the same buddies group thus cannot play against each other. You first need to create a buddies group and add both players to it.',
      );
    }

    const maybeAlreadyStartedMatchBetweenThesePlayers =
      await this.matchRepository.findCurrentStartedGameBetweenPlayers(
        startMatchCommand.homeTeam.player,
        startMatchCommand.awayTeam.player,
      );
    if (!maybeAlreadyStartedMatchBetweenThesePlayers.isNull()) {
      throw new Error(
        `There is already a started match between these players.: ${JSON.stringify(
          maybeAlreadyStartedMatchBetweenThesePlayers.get().takeSnapshot(),
        )}`,
      );
    }

    const match = MatchEntity.between({
      id: startMatchCommand.matchId,
      home: startMatchCommand.homeTeam,
      away: startMatchCommand.awayTeam,
    });

    await this.matchRepository.save(match);

    return match.takeSnapshot();
  }
}
