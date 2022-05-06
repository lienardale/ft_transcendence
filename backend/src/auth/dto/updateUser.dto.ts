import { IsEnum, IsOptional, IsString, IsBoolean } from "class-validator";
import { UserStatus } from "../helpers/user.status.enum";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  @IsOptional()
  avatar_path?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsBoolean()
  @IsOptional()
  banned_user?: boolean;

  @IsBoolean()
  @IsOptional()
  web_admin?: boolean;

  @IsString()
  @IsOptional()
  level?: string;
  
  @IsString()
  @IsOptional()
  level2factor_auth?: string;

  @IsString()
  @IsOptional()
  level2factor_secret?: string;
}