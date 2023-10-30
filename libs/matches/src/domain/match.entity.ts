import {
  EndPeriodAction,
  PlayerAction,
  PlayerActionFactory,
} from './player-action';

export enum StarRating {
  HALF = 0.5,
  ONE = 1,
  ONE_AND_HALF = 1.5,
  TWO = 2,
  TWO_AND_HALF = 2.5,
  THREE = 3,
  THREE_AND_HALF = 3.5,
  FOUR = 4,
  FOUR_AND_HALF = 4.5,
  FIVE = 5,
}

type Team = {
  player: string;
  name: string;
  stars: StarRating;
  score: number;
};

export enum GoalType {
  MALADE = 'malade',
  CAROTTE = 'carotte',
  KETCHUP = 'ketchup',
  NORMAL = 'normal',
}

export enum MatchState {
  STARTED = 'started',
  HALFTIME = 'halftime',
  FINISHED = 'finished',
}

export class MatchEntity {
  constructor(
    private readonly props: {
      id: string;
      home: Team;
      away: Team;
      state: MatchState;
    },
  ) {}

  static between(props: {
    id: string;
    home: Omit<Team, 'score'>;
    away: Omit<Team, 'score'>;
  }) {
    return new MatchEntity({
      id: props.id,
      home: {
        ...props.home,
        score: 0,
      },
      away: {
        ...props.away,
        score: 0,
      },
      state: MatchState.STARTED,
    });
  }

  get id() {
    return this.props.id;
  }

  scoreGoal({
    scoredBy,
    goalType,
  }: {
    scoredBy: string;
    goalType: GoalType;
  }): PlayerAction[] {
    if (this.props.home.player === scoredBy) {
      this.props.home.score += 1;
    } else if (this.props.away.player === scoredBy) {
      this.props.away.score += 1;
    } else {
      throw new Error('Player not in this match');
    }

    const against =
      this.props.home.player === scoredBy ? this.props.away : this.props.home;

    return PlayerActionFactory.create({
      scoredBy,
      against: against.player,
      goalType,
      ratingDiff:
        against.player === scoredBy
          ? this.computeAwayRatingDiff()
          : this.computeHomeRatingDiff(),
    });
  }

  halfTime(): PlayerAction[] {
    if (this.props.state !== MatchState.STARTED) {
      throw new Error('Match is not started or already finished');
    }
    this.props.state = MatchState.HALFTIME;
    return this.handleEndPeriod();
  }

  endMatch(): PlayerAction[] {
    if (this.props.state !== MatchState.HALFTIME) {
      throw new Error(
        'Match was not in the second half or is already finished',
      );
    }
    this.props.state = MatchState.FINISHED;
    return this.handleEndPeriod();
  }

  private handleEndPeriod() {
    if (this.props.home.score === this.props.away.score) {
      return [
        new EndPeriodAction(
          this.props.home.player,
          this.computeHomeRatingDiff(),
        ),
        new EndPeriodAction(
          this.props.away.player,
          this.computeAwayRatingDiff(),
        ),
      ];
    }

    return [];
  }

  private computeHomeRatingDiff() {
    return this.computeRatingDiff(this.props.home.stars, this.props.away.stars);
  }

  private computeAwayRatingDiff() {
    return this.computeRatingDiff(this.props.away.stars, this.props.home.stars);
  }

  private computeRatingDiff(
    starsRatingA: StarRating,
    starsRatingB: StarRating,
  ) {
    return Math.ceil(Math.abs(starsRatingA - starsRatingB));
  }

  takeSnapshot() {
    return structuredClone(this.props);
  }

  static fromSnapshot(snapshot: {
    id: string;
    home: Omit<Team, 'stars'> & { stars: number };
    away: Omit<Team, 'stars'> & { stars: number };
    state: string;
  }) {
    return new MatchEntity({
      id: snapshot.id,
      home: {
        ...snapshot.home,
        stars: snapshot.home.stars as StarRating,
      },
      away: {
        ...snapshot.away,
        stars: snapshot.away.stars as StarRating,
      },
      state: snapshot.state as MatchState,
    });
  }
}
