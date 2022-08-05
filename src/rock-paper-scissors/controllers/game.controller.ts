import { Controller, Get } from '@nestjs/common';
import { Game } from '../schemas/game.schema';
import { Shapes, PlayerChoice } from '../types/game';
import { GameModel } from '../services/game.model';

@Controller('game')
export class GameController {
  constructor(private test: GameModel) {}

  @Get()
  async getHello(): Promise<Game> {
    // await this.test.create({
    //   roundsCount: 7,
    //   players: [
    //     {
    //       socketId: 'test',
    //       nickName: 'Blat',
    //     },
    //   ],
    // });

    // return await this.test.update({});
    // const gameInfo = await this.test.makeRoundChoice({
    //   gameId: '62d969f75e1bb46dfc22ab5e',
    //   round: {
    //     roundNumber: 2,
    //     choices: [
    //       {
    //         userSocket: 'someSocket',
    //         choice: Choices.PAPER,
    //       },
    //     ],
    //     winner: null,
    //   },
    // });
    //
    // console.log(gameInfo);

    // return gameInfo;

    return await this.test.addChoiceToRound({
      gameId: '62d969f75e1bb46dfc22ab5e',
      roundNumber: 1,
      playerChoice: {
        userSocket: 'someSocket',
        choice: Shapes.SCISSORS,
      },
      currentRound: 2,
      winner: null,
    });
  }
}
