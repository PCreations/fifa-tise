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
}
