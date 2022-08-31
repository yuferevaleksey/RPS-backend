import { GameRound } from '../types/game';

export type AddRoundDto = {
  gameId: string;
  round: GameRound;
};
