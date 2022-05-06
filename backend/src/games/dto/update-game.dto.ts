import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateGameDto } from './create-game.dto';
import { User } from '../../auth/entities/user.entity'

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsOptional()
  @IsString()
  type_game?: string;

  @IsOptional()
  score_player1?: number;

  @IsOptional()
  score_player2?: number;
  
  @IsOptional()
  userPlayer1?: User;

  @IsOptional()
  userPlayer2?: User;  
}
