import { Game } from '../schemas/game.schema';

export enum Shapes {
  ROCK = 'rock',
  SCISSORS = 'scissors',
  PAPER = 'paper',
}

export type PlayerChoice = {
  userSocket: string;
  choice: Shapes;
};

export type GameRound = {
  roundNumber: number;
  choices: PlayerChoice[];
  winner: string;
};

export type Player = {
  socketId: string;
  nickName: string;
};

type PickOnly<T, K extends keyof T> = Pick<T, K> & {
  [P in Exclude<keyof T, K>]?: never;
};

export type GameItem = PickOnly<Game, 'id' | 'roundsCount'>;
