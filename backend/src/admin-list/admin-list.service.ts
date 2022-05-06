import { Injectable } from '@nestjs/common';
import { CreateAdminListDto } from './dto/create-admin-list.dto';
import { UpdateAdminListDto } from './dto/update-admin-list.dto';

@Injectable()
export class AdminListService {
  create(createAdminListDto: CreateAdminListDto) {
    return 'This action adds a new adminList';
  }

  findAll() {
    return `This action returns all adminList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminList`;
  }

  update(id: number, updateAdminListDto: UpdateAdminListDto) {
    return `This action updates a #${id} adminList`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminList`;
  }
}
