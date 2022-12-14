import { Injectable } from '@nestjs/common';
import { PlayerChoice, Shapes } from '../../types/game';

import { Rock } from './shapes/rock';
import { Scissors } from './shapes/scissors';
import { Paper } from './shapes/paper';
import { ShapeAbstractInterface } from './shapes/shape-abstract';

const mappers = new Map<Shapes, any>([
  [Shapes.SCISSORS, Scissors],
  [Shapes.PAPER, Paper],
  [Shapes.ROCK, Rock],
]);

@Injectable()
export class GameProcess {
  getShape(userChoice: PlayerChoice): ShapeAbstractInterface | undefined {
    if (mappers.has(userChoice.choice)) {
      const className = mappers.get(userChoice.choice);
      return new className(userChoice);
    }
  }
}
