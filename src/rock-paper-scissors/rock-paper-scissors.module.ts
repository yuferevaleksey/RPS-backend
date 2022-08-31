import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSchema } from './schemas/game.schema';
import { GameGateway } from './gateways/game.gateway';
import { GameModel } from './services/game.model';
import { GameService } from './services/game.service';
import { GameProcess } from './services/game-process/game-process.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Game', schema: GameSchema }])],
  providers: [GameService, GameModel, GameGateway, GameProcess],
})
export class RockPaperScissorsModule {}
