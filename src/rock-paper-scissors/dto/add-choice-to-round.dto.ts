import { PlayerChoice } from '../types/game';

export type AddChoiceToRoundDto = {
  gameId: string;
  currentRound: number;
  roundNumber: number;
  playerChoice: PlayerChoice;
  winner: string;
};
