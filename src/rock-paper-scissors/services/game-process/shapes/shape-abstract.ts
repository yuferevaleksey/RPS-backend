import { PlayerChoice, Shapes } from '../../../types/game';

export interface ShapeAbstractInterface {
  weakness: Shapes;
  playerChoice: PlayerChoice;
  returnWinner: (opponentChoice: PlayerChoice) => PlayerChoice;
}

export abstract class ShapeAbstract implements ShapeAbstractInterface {
  abstract weakness: Shapes;
  abstract playerChoice: PlayerChoice;

  returnWinner(opponentChoice: PlayerChoice): PlayerChoice {
    if (opponentChoice.choice === this.weakness) {
      return opponentChoice;
    }

    if (opponentChoice.choice === this.playerChoice.choice) {
      return;
    }

    return this.playerChoice;
  }
}
