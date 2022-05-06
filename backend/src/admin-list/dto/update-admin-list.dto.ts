import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminListDto } from './create-admin-list.dto';

export class UpdateAdminListDto extends PartialType(CreateAdminListDto) {}
