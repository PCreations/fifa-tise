import { GoalType } from './match.entity';

export abstract class PlayerAction {
  shots: number;

  constructor(
    protected readonly playerName: string,
    protected readonly description: string,
    readonly multiplier: number,
    readonly ratingDiff: number,
  ) {
    this.shots = (1 + ratingDiff) * this.multiplier;
  }
}

export class ButMaladeAction extends PlayerAction {
  constructor(playerName: string, ratingDiff: number) {
    super(
      playerName,
      'But incroyable, malade ! Tu dois boire le double de shots',
      2,
      ratingDiff,
    );
  }
}

export class ButCarotteAction extends PlayerAction {
  constructor(playerName: string, ratingDiff: number) {
    super(
      playerName,
      "But carotte, c'était que de la chance... Moitié moins de shots pour toi !",
      0.5,
      ratingDiff,
    );
  }
}

export class ButKetchupMisAction extends PlayerAction {
  static readonly MULTIPLIER = 0.5;
  description =
    'But Ketchup mis, quel manque de respect...Le joueur ayant marqué doit boire la moitié des shots de son adversaire...';
  constructor(playerName: string, ratingDiff: number) {
    super(
      playerName,
      'But Ketchup mis, quel manque de respect...Le joueur ayant marqué doit boire la moitié des shots de son adversaire...',
      0.5,
      ratingDiff,
    );
  }
}

export class ButKetchupPrisAction extends PlayerAction {
  static readonly MULTIPLIER = 1;
  description =
    'But Ketchup pris, quel manque de respect...Tu bois juste le nombre de shots normal, mais ton adversaire en boit la moitié aussi !';
  constructor(playerName: string, ratingDiff: number) {
    super(
      playerName,
      'But Ketchup pris, quel manque de respect...Tu bois juste le nombre de shots normal, mais ton adversaire en boit la moitié aussi !',
      1,
      ratingDiff,
    );
  }
}

export class ButNormalAction extends PlayerAction {
  static readonly MULTIPLIER = 1;
  description =
    'But normal pris, rien de spécial, chacun boit le nombre de shots normal';
  constructor(playerName: string, ratingDiff: number) {
    super(
      playerName,
      'But normal pris, rien de spécial, chacun boit le nombre de shots normal',
      1,
      ratingDiff,
    );
  }
}

export class EndPeriodAction extends PlayerAction {
  readonly MULTIPLIER = 1;
  description = 'Egalité, chacun boit le nombre de shots normal';
  constructor(playerName: string, ratingDiff: number) {
    super(
      playerName,
      'Egalité, chacun boit le nombre de shots normal',
      1,
      ratingDiff,
    );
  }
}

export class PlayerActionFactory {
  static create({
    scoredBy,
    against,
    goalType,
    againstRatingDiff,
    scoredByRatingDiff,
  }: {
    scoredBy: string;
    against: string;
    goalType: GoalType;
    againstRatingDiff: number;
    scoredByRatingDiff: number;
  }): PlayerAction[] {
    console.log({
      scoredBy,
      against,
      goalType,
      againstRatingDiff,
      scoredByRatingDiff,
    });
    switch (goalType) {
      case GoalType.MALADE:
        return [new ButMaladeAction(against, againstRatingDiff)];
      case GoalType.CAROTTE:
        return [new ButCarotteAction(against, againstRatingDiff)];
      case GoalType.KETCHUP:
        return [
          new ButKetchupMisAction(scoredBy, againstRatingDiff),
          new ButKetchupPrisAction(against, againstRatingDiff),
        ];
      case GoalType.NORMAL:
        return [new ButNormalAction(against, againstRatingDiff)];
    }
  }
}
