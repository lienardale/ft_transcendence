import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class GetPasswordDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  channelId: number;
}