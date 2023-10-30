import { GoalType } from './match.entity';

export abstract class PlayerAction {
  playerName: string;
  shots: number;
  description: string;

  protected computeShots(ratingDiff: number) {
    return Math.ceil(ratingDiff);
  }
}

export class ButMaladeAction extends PlayerAction {
  static readonly MULTIPLIER = 2;
  description = 'But incroyable, malade ! Tu dois boire le double de shots';
  constructor(
    public playerName: string,
    ratingDiff: number,
  ) {
    super();
    this.shots = this.computeShots(ratingDiff * ButMaladeAction.MULTIPLIER);
  }
}

export class ButCarotteAction extends PlayerAction {
  static readonly MULTIPLIER = 0.5;
  description =
    "But carotte, c'était que de la chance... Moitié moins de shots pour toi !";
  constructor(
    public playerName: string,
    ratingDiff: number,
  ) {
    super();
    this.shots = this.computeShots(ratingDiff * ButCarotteAction.MULTIPLIER);
  }
}

export class ButKetchupMisAtion extends PlayerAction {
  static readonly MULTIPLIER = 0.5;
  description =
    'But Ketchup mis, quel manque de respect...Le joueur ayant marqué doit boire la moitié des shots de son adversaire...';
  constructor(
    public playerName: string,
    ratingDiff: number,
  ) {
    super();
    this.shots = this.computeShots(ratingDiff * ButKetchupMisAtion.MULTIPLIER);
  }
}

export class ButKetchupPrisAtion extends PlayerAction {
  static readonly MULTIPLIER = 1;
  description =
    'But Ketchup pris, quel manque de respect...Tu bois juste le nombre de shots normal, mais ton adversaire en boit la moitié aussi !';
  constructor(
    public playerName: string,
    ratingDiff: number,
  ) {
    super();
    this.shots = this.computeShots(ratingDiff * ButKetchupPrisAtion.MULTIPLIER);
  }
}

export class ButNormalAction extends PlayerAction {
  static readonly MULTIPLIER = 1;
  description =
    'But normal pris, rien de spécial, chacun boit le nombre de shots normal';
  constructor(
    public playerName: string,
    ratingDiff: number,
  ) {
    super();
    this.shots = this.computeShots(ratingDiff * ButKetchupPrisAtion.MULTIPLIER);
  }
}

export class EndPeriodAction extends PlayerAction {
  static readonly MULTIPLIER = 1;
  description = 'Egalité, chacun boit le nombre de shots normal';
  constructor(
    public playerName: string,
    ratingDiff: number,
  ) {
    super();
    this.shots = this.computeShots(ratingDiff * EndPeriodAction.MULTIPLIER);
  }
}

export class PlayerActionFactory {
  static create({
    scoredBy,
    against,
    goalType,
    ratingDiff,
  }: {
    scoredBy: string;
    against: string;
    goalType: GoalType;
    ratingDiff: number;
  }): PlayerAction[] {
    switch (goalType) {
      case GoalType.MALADE:
        return [new ButMaladeAction(against, ratingDiff)];
      case GoalType.CAROTTE:
        return [new ButCarotteAction(against, ratingDiff)];
      case GoalType.KETCHUP:
        return [
          new ButKetchupMisAtion(against, ratingDiff),
          new ButKetchupPrisAtion(scoredBy, ratingDiff),
        ];
      case GoalType.NORMAL:
        return [new ButNormalAction(against, ratingDiff)];
    }
  }
}
