import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { UsersService } from './pong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { GamesModule } from 'src/games/games.module';
import { GamesService } from 'src/games/games.service';
import { PongGateway } from './pong.gateway';
import { Game } from '../games/entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    AuthModule,
    GamesModule,
    HttpModule,
    PongModule,
  ],
  controllers: [],
  providers: [PongService, UsersService, AuthService, GamesService, PongGateway]
})
export class PongModule {}
