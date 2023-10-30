import { GoalType } from '@matches/domain/match.entity';
import { MatchRepository } from '@matches/domain/match.repository';
import { Injectable } from '@nestjs/common';

type ScoreGoalCommand = {
  matchId: string;
  scoredBy: string;
  goalType: string;
};

@Injectable()
export class ScoreGoal {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(scoreGoalCommand: ScoreGoalCommand) {
    const match = await this.getMatch(scoreGoalCommand.matchId);
    const goalType = this.getGoalType(scoreGoalCommand.goalType);

    const playerActions = match.scoreGoal({
      scoredBy: scoreGoalCommand.scoredBy,
      goalType,
    });

    return playerActions;
  }

  private async getMatch(matchId: string) {
    const maybeMatch = await this.matchRepository.getById(matchId);
    return maybeMatch.getOrThrow(new Error('Match not found'));
  }

  private getGoalType(goalType: string) {
    if (Object.values(GoalType).includes(goalType as GoalType)) {
      return goalType as GoalType;
    }

    throw new Error('Invalid goal type');
  }
}
