import { Injectable, Logger } from '@nestjs/common';
import { GameModel } from './game.model';
import { Game } from '../schemas/game.schema';
import { GameItem, GameRound, PlayerChoice } from '../types/game';
import { AddChoiceToRoundDto } from '../dto/add-choice-to-round.dto';
import { GameProcess } from './game-process/game-process.service';

@Injectable()
export class GameService {
  readonly TIE = 'TIE';

  private readonly logger = new Logger(GameService.name);

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
    try {
      return this.gameModel.create({
        roundsCount,
        players: [{ socketId, nickName }],
      });
    } catch (e) {
      this.logger.error(
        `Error while saving new game data. [nick_name]=${nickName}, [socket_id]=${socketId}. ${e} `,
      );
    }

    return;
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
      this.logger.warn(
        `Cannot find game data by provided [game_id]=${gameId}, [socket_id]=${socketId}`,
      );
      return;
    }

    if (gameData.players.length === 2) {
      this.logger.warn(
        `The game, [game_id]=${gameId}, couldn't contain more than two players. [socket_id]=${socketId}`,
      );
      return gameData;
    }

    if (gameData.players.find((player) => player.socketId === socketId)) {
      this.logger.warn(
        `Player with socket ${socketId} already joined to the [game_id]=${gameId}.`,
      );
      return gameData;
    }

    try {
      return this.gameModel.join({ gameId, player: { nickName, socketId } });
    } catch (e) {
      this.logger.error(
        `[game_id]=${gameId}, [socket_id]=${socketId}. Error ${e} `,
      );
    }

    return gameData;
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
      this.logger.warn(
        `Cannot find game data by provided [game_id]=${gameId}, [socket_id]=${playerChoice.userSocket}`,
      );
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
          ?.returnWinner(gameRound.choices[0])?.userSocket || this.TIE;

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
    const gamesList = await this.gameModel.findAvailableGames();
    return gamesList.map(
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
      this.logger.warn(`Cannot find game data by provided [game_id]=${gameId}`);
      return;
    }

    if (gameData.currentRound >= gameData.roundsCount) {
      this.logger.log(`Game has to be finished [game_id]=${gameId}`);
      return this.gameModel.finishGame(gameId);
    }

    const nextRoundNumber = gameData.currentRound + 1;

    this.logger.warn(`Update current round for [game_id]=${gameId}`);
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
