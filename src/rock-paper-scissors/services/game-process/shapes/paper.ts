import { ShapeAbstract } from './shape-abstract';
import { PlayerChoice, Shapes } from '../../../types/game';

export class Paper extends ShapeAbstract {
  weakness: Shapes = Shapes.SCISSORS;
  constructor(public playerChoice: PlayerChoice) {
    super();
  }
}
