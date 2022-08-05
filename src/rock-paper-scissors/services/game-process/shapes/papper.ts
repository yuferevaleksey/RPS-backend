import { ShapeAbstract } from './shape-abstract';
import { PlayerChoice, Shapes } from '../../../types/game';

export class Papper extends ShapeAbstract {
  achillesHeel: Shapes = Shapes.SCISSORS;
  constructor(public payerChoice: PlayerChoice) {
    super();
  }
}
