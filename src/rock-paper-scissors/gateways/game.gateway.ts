import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from '../services/game.service';
import { Game } from '../schemas/game.schema';
import { GameItem, Shapes } from '../types/game';

export type GeneralGameMessage = {
  gameId: string;
};

export type GeneralSocketMessage = {
  socketId: string;
};

export type StartNewGameMessage = GeneralSocketMessage & {
  nickName: string;
  roundsCount: number;
};

export type JoinNewGameMessage = GeneralGameMessage &
  GeneralSocketMessage & {
    nickName: string;
  };

export type MakeChoiceMessage = GeneralGameMessage &
  GeneralSocketMessage & {
    choice: Shapes;
  };

export type MoveToNextRoundMessage = GeneralGameMessage & GeneralSocketMessage;

export type PauseGameMessage = GeneralGameMessage & GeneralSocketMessage;
export type ResumeGameMessage = GeneralGameMessage & GeneralSocketMessage;
export type QuitGAmeMessage = GeneralGameMessage & GeneralSocketMessage;

enum IncomingEvents {
  START_NEW_GAME = 'startNewGame',
  JOIN_GAME = 'joinGame',
  MAKE_CHOICE = 'makeChoice',
  GET_GAMES_LIST = 'getGamesList',
  MOVE_NEXT_ROUND = 'moveNextRound',
  PAUSE_GAME = 'pauseGame',
  RESUME_GAME = 'resumeGame',
  QUIT_GAME = 'quitGame',
}

enum OutgoingEvents {
  CONNECTED_SUCCESSFULLY = 'connectedSuccessfully',
  GAME_RESPONSE = 'gameResponse',
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server;

  constructor(private gameService: GameService) {}

  async handleConnection(socket: Socket) {
    this.server
      .to(socket.id)
      .emit(OutgoingEvents.CONNECTED_SUCCESSFULLY, socket.id);
  }

  async handleDisconnect(socket: Socket) {
    console.log('Disconnect!!!', socket.id);
  }

  /**
   * Start new game.
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.START_NEW_GAME)
  async startNewGame(@MessageBody() message: string): Promise<Game> {
    const { socketId, nickName, roundsCount } = JSON.parse(
      message,
    ) as StartNewGameMessage;
    return this.gameService.createNewGame(nickName, socketId, roundsCount);
  }

  /**
   * Join game.
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.JOIN_GAME)
  async joinGame(@MessageBody() message: string): Promise<Game> {
    const { gameId, nickName, socketId } = JSON.parse(
      message,
    ) as JoinNewGameMessage;

    const gameData = await this.gameService.joinGame(
      gameId,
      nickName,
      socketId,
    );

    // Inform other user about game joining.
    return this.notifyOpponent(
      gameData,
      socketId,
      OutgoingEvents.GAME_RESPONSE,
    );
  }

  /**
   * Fet game list.
   */
  @SubscribeMessage(IncomingEvents.GET_GAMES_LIST)
  async getGamesList(): Promise<GameItem[]> {
    return this.gameService.getGamesList();
  }

  /**
   * Make choice in round.
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.MAKE_CHOICE)
  async makeChoice(@MessageBody() message: string): Promise<Game> {
    const { gameId, choice, socketId } = JSON.parse(
      message,
    ) as MakeChoiceMessage;
    const gameData = await this.gameService.makeChoice(gameId, {
      userSocket: socketId,
      choice,
    });

    // Inform other user about made choice.
    return this.notifyOpponent(
      gameData,
      socketId,
      OutgoingEvents.GAME_RESPONSE,
    );
  }

  /**
   * Move next round.
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.MOVE_NEXT_ROUND)
  async moveToNextRound(@MessageBody() message: string): Promise<Game> {
    const { gameId, socketId } = JSON.parse(message) as MoveToNextRoundMessage;
    const gameData = await this.gameService.moveToNextRound(gameId);

    return this.notifyOpponent(
      gameData,
      socketId,
      OutgoingEvents.GAME_RESPONSE,
    );
  }

  /**
   * Pause game.
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.PAUSE_GAME)
  async pauseGame(@MessageBody() message: string): Promise<Game> {
    const { gameId, socketId } = JSON.parse(message) as PauseGameMessage;
    const gameData = await this.gameService.pauseGame(gameId, socketId);

    return this.notifyOpponent(
      gameData,
      socketId,
      OutgoingEvents.GAME_RESPONSE,
    );
  }

  /**
   * Resume game.
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.RESUME_GAME)
  async resumeGame(@MessageBody() message: string): Promise<any> {
    const { gameId, socketId } = JSON.parse(message) as ResumeGameMessage;
    const gameData = await this.gameService.resumeGame(gameId);

    return this.notifyOpponent(
      gameData,
      socketId,
      OutgoingEvents.GAME_RESPONSE,
    );
  }

  /**
   *
   * @param message
   */
  @SubscribeMessage(IncomingEvents.QUIT_GAME)
  async quitGame(@MessageBody() message: string): Promise<any> {
    const { gameId, socketId } = JSON.parse(message) as QuitGAmeMessage;
    const gameData = await this.gameService.quitGame(gameId);

    return this.notifyOpponent(
      gameData,
      socketId,
      OutgoingEvents.GAME_RESPONSE,
    );
  }

  /**
   * Function notify Rival player.
   *
   * @param gameData
   * @param playerSocket
   * @param event
   * @private
   */
  private notifyOpponent(
    gameData: Game,
    playerSocket: string,
    event: OutgoingEvents,
  ): Game {
    // Inform other user about game joining.
    const rival = gameData?.players?.find(
      (user) => user.socketId !== playerSocket,
    );

    if (rival) {
      this.server.to(rival.socketId).emit(event, JSON.stringify(gameData));
    }

    return gameData;
  }
}
