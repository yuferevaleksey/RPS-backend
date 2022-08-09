import { ShapeAbstract } from './shape-abstract';
import { PlayerChoice, Shapes } from '../../../types/game';

export class Scissors extends ShapeAbstract {
  weakness: Shapes = Shapes.ROCK;
  constructor(public payerChoice: PlayerChoice) {
    super();
  }
}
