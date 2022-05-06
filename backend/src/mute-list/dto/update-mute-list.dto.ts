import { PartialType } from '@nestjs/mapped-types';
import { CreateMuteListDto } from './create-mute-list.dto';

export class UpdateMuteListDto extends PartialType(CreateMuteListDto) {
    unmutetime: Date;
}
