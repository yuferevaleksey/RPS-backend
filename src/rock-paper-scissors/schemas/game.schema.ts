import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameRound, Player } from '../types/game';

@Schema({ collection: 'games' })
export class Game extends Document {
  @Prop()
  roundsCount: number;

  @Prop()
  currentRound: number;

  @Prop()
  players: Player[];

  @Prop()
  rounds: GameRound[];

  @Prop()
  paused: boolean;

  @Prop()
  finished: boolean;

  @Prop()
  pausedBy: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);
