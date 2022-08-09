import { ShapeAbstract } from './shape-abstract';
import { PlayerChoice, Shapes } from '../../../types/game';

export class Rock extends ShapeAbstract {
  weakness: Shapes = Shapes.PAPER;
  constructor(public payerChoice: PlayerChoice) {
    super();
  }
}
