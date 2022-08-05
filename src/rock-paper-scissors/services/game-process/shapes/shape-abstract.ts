import { PlayerChoice, Shapes } from '../../../types/game';

export interface ShapeAbstractInterface {
  achillesHeel: Shapes;
  payerChoice: PlayerChoice;
  returnWinner: (rivalChoice: PlayerChoice) => PlayerChoice;
}

export abstract class ShapeAbstract implements ShapeAbstractInterface {
  abstract achillesHeel: Shapes;
  abstract payerChoice: PlayerChoice;

  returnWinner(rivalChoice: PlayerChoice): PlayerChoice {
    if (rivalChoice.choice === this.achillesHeel) {
      return rivalChoice;
    }

    if (rivalChoice.choice === this.payerChoice.choice) {
      return;
    }

    return this.payerChoice;
  }
}
