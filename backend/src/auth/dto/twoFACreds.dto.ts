import { IsNotEmpty, IsString } from "class-validator";
import { User } from "../entities/user.entity";

export class TwoFACredsDto {
  @IsNotEmpty()
  user: User

  @IsString()
  @IsNotEmpty()
  code: string;
}