import { IsNotEmpty, IsString } from "class-validator";

export class GetCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}