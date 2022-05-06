import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockedListDto } from './create-blocked-list.dto';

export class UpdateBlockedListDto extends PartialType(CreateBlockedListDto) {}
