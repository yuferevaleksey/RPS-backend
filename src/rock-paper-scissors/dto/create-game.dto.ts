import { Player } from '../types/game';

export type CreateGameDto = {
  roundsCount: number;
  players: Player[];
};
