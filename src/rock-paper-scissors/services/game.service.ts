import { Injectable } from '@nestjs/common';
import { GameModel } from './game.model';
import { Game } from '../schemas/game.schema';
import { GameItem, GameRound, PlayerChoice } from '../types/game';
import { AddChoiceToRoundDto } from '../dto/add-choice-to-round.dto';
import { GameProcess } from './game-process/game-process.service';

@Injectable()
export class GameService {
  readonly NO_ONE_WIN = 'noOneWin';

  constructor(private gameModel: GameModel, private gameProcess: GameProcess) {}

  /**
   * Create new Game with one player(owner)
   *
   * @param nickName
   * @param socketId
   * @param roundsCount
   */
  public async createNewGame(
    nickName: string,
    socketId: string,
    roundsCount: number,
  ): Promise<Game> {
    //ToDo: add checks for errors while saving here.
    return this.gameModel.create({
      roundsCount,
      players: [{ socketId, nickName }],
    });
  }

  /**
   *
   * @param gameId
   * @param nickName
   * @param socketId
   */
  public async joinGame(
    gameId: string,
    nickName: string,
    socketId: string,
  ): Promise<Game> {
    const gameData = await this.gameModel.findGame(gameId);
    if (!gameData) {
      // @todo: throw error here;
      return;
    }

    if (gameData.players.length === 2) {
      return;
    }

    if (gameData.players.find((player) => player.socketId === socketId)) {
      return;
    }

    //ToDo: add checks for errors while saving here.
    return this.gameModel.join({ gameId, player: { nickName, socketId } });
  }

  /**
   * The user makes a choice in the current round.
   * If the round hasn't existed yet, we will create a new one!
   *
   * @param gameId
   * @param playerChoice
   */
  public async makeChoice(
    gameId: string,
    playerChoice: PlayerChoice,
  ): Promise<Game> {
    const gameData = await this.gameModel.findGame(gameId);
    if (!gameData) {
      // @todo: throw error here;
      return;
    }

    const currentRound = gameData?.currentRound;

    const gameRound = gameData?.rounds?.find(
      (round) => round.roundNumber === gameData.currentRound,
    );

    if (!gameRound) {
      return this.gameModel.makeRound({
        gameId,
        round: {
          winner: null,
          roundNumber: currentRound,
          choices: [playerChoice],
        } as GameRound,
      });
    }

    let winner = null;
    if (gameRound.choices.length === 1) {
      winner =
        this.gameProcess
          .getShape(playerChoice)
          ?.returnWinner(gameRound.choices[0])?.userSocket || this.NO_ONE_WIN;

      return this.gameModel.addChoiceToRound({
        gameId,
        roundNumber: currentRound,
        playerChoice,
        winner,
      } as AddChoiceToRoundDto);
    }

    return gameData;
  }

  /**
   * Get list for all games.
   */
  public async getGamesList(): Promise<GameItem[]> {
    const gamesList = await this.gameModel.findAll();
    return gamesList
      .filter((game) => !game.finished && game.players.length === 1)
      .map(
        (game) =>
          ({
            id: game.id,
            roundsCount: game.roundsCount,
          } as GameItem),
      );
  }

  /**
   * Move to next round.
   *
   * @param gameId
   */
  public async moveToNextRound(gameId: string) {
    const gameData = await this.gameModel.findGame(gameId);
    if (!gameData) {
      return;
    }

    if (gameData.currentRound >= gameData.roundsCount) {
      return this.gameModel.finishGame(gameId);
    }

    const nextRoundNumber = gameData.currentRound + 1;

    return this.gameModel.moveToNextRound({ gameId, nextRoundNumber });
  }

  public async pauseGame(gameId: string, socketId: string) {
    return this.gameModel.pauseGame(gameId, socketId);
  }

  public async resumeGame(gameId: string) {
    return this.gameModel.resumeGame(gameId);
  }

  public async quitGame(gameId: string) {
    return this.gameModel.finishGame(gameId);
  }
}
