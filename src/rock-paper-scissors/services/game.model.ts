import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from '../schemas/game.schema';
import { CreateGameDto } from '../dto/create-game.dto';
import { JoinGameDto } from '../dto/join-game.dto';
import { AddRoundDto } from '../dto/add-round.dto';
import { AddChoiceToRoundDto } from '../dto/add-choice-to-round.dto';
import { MoveNextRoundDto } from '../dto/move-next-round.dto';

@Injectable()
export class GameModel {
  constructor(@InjectModel('Game') private gameModel: Model<Game>) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const createdGameModel = new this.gameModel({
      ...createGameDto,
      currentRound: 1,
    });
    return createdGameModel.save();
  }

  async join({ gameId, player }: JoinGameDto): Promise<Game> {
    return this.gameModel.findByIdAndUpdate(
      gameId,
      {
        $push: {
          players: player,
        },
      },
      { new: true },
    );
  }

  /**
   *
   * @param gameId
   * @param socketId
   */
  async pauseGame(gameId: string, socketId: string): Promise<Game> {
    return this.gameModel.findByIdAndUpdate(
      gameId,
      {
        paused: true,
        pausedBy: socketId,
      },
      { new: true },
    );
  }

  /**
   *
   * @param gameId
   */
  async resumeGame(gameId: string): Promise<Game> {
    return this.gameModel.findByIdAndUpdate(gameId, {
      paused: false,
      pausedBy: '',
    });
  }

  /**
   *
   * @param gameId
   */
  async finishGame(gameId: string): Promise<Game> {
    return this.gameModel.findByIdAndUpdate(
      gameId,
      {
        finished: true,
      },
      { new: true },
    );
  }

  /**
   *
   * @param gameId
   * @param round
   */
  async makeRound({ gameId, round }: AddRoundDto): Promise<Game> {
    return this.gameModel.findByIdAndUpdate(
      gameId,
      {
        $push: {
          rounds: round,
        },
      },
      { new: true },
    );
  }

  /**
   *
   * @param gameId
   * @param nextRoundNumber
   */
  async moveToNextRound({
    gameId,
    nextRoundNumber,
  }: MoveNextRoundDto): Promise<Game> {
    return this.gameModel.findByIdAndUpdate(
      gameId,
      {
        currentRound: nextRoundNumber,
      },
      { new: true },
    );
  }

  /**
   *
   * @param gameId
   * @param roundNumber
   * @param playerChoice
   * @param currentRound
   * @param winner
   */
  async addChoiceToRound({
    gameId,
    roundNumber,
    playerChoice,
    currentRound,
    winner,
  }: AddChoiceToRoundDto): Promise<Game> {
    return this.gameModel.findOneAndUpdate(
      {
        _id: gameId,
        'rounds.roundNumber': roundNumber,
      },
      {
        currentRound: currentRound,
        'rounds.$.winner': winner,
        $push: {
          'rounds.$.choices': playerChoice,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   *
   * @param gameId
   */
  async findGame(gameId: string): Promise<Game> {
    return this.gameModel.findById(gameId);
  }

  /**
   *
   */
  async findAll(): Promise<Game[]> {
    return this.gameModel.find().exec();
  }
}
