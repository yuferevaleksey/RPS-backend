import { Player } from '../types/game';

export type JoinGameDto = {
  gameId: string;
  player: Player;
};
