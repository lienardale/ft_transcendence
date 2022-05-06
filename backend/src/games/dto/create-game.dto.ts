import { IsNotEmpty, IsString } from "class-validator";
import { User } from '../../auth/entities/user.entity'

export class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  type_game: string;

  @IsNotEmpty()
  userPlayer1?: User;
}
