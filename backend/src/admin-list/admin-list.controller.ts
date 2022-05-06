import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { AdminListService } from './admin-list.service';
import { CreateAdminListDto } from './dto/create-admin-list.dto';
import { UpdateAdminListDto } from './dto/update-admin-list.dto';
import JwtGuard from 'src/auth/strategies/jwt.guard';

@Controller('admin-list')
@UseGuards(JwtGuard)
export class AdminListController {
  constructor(private readonly adminListService: AdminListService) {}

  @Post()
  create(@Body() createAdminListDto: CreateAdminListDto) {
    return this.adminListService.create(createAdminListDto);
  }

  @Get()
  findAll() {
    return this.adminListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminListDto: UpdateAdminListDto) {
    return this.adminListService.update(+id, updateAdminListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminListService.remove(+id);
  }
}
