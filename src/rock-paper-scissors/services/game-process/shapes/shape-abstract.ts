import { PlayerChoice, Shapes } from '../../../types/game';

export interface ShapeAbstractInterface {
  weakness: Shapes;
  payerChoice: PlayerChoice;
  returnWinner: (opponentChoice: PlayerChoice) => PlayerChoice;
}

export abstract class ShapeAbstract implements ShapeAbstractInterface {
  abstract weakness: Shapes;
  abstract payerChoice: PlayerChoice;

  returnWinner(opponentChoice: PlayerChoice): PlayerChoice {
    if (opponentChoice.choice === this.weakness) {
      return opponentChoice;
    }

    if (opponentChoice.choice === this.payerChoice.choice) {
      return;
    }

    return this.payerChoice;
  }
}
