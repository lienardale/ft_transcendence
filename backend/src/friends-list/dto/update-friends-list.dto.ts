import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendsListDto } from './create-friends-list.dto';
import { IsString } from "class-validator";

export class UpdateFriendsListDto extends PartialType(CreateFriendsListDto) {
    @IsString()
    friendship_status?: string;
}
