import { Controller, Get, Post, Body, Req, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MuteListService } from './mute-list.service';
import { CreateMuteListDto } from './dto/create-mute-list.dto';
import { UpdateMuteListDto } from './dto/update-mute-list.dto';
import JwtGuard from 'src/auth/strategies/jwt.guard';

@Controller('mute-list')
@UseGuards(JwtGuard)
export class MuteListController {
  constructor(private readonly muteListService: MuteListService) {}

  @Post()
  async create(@Body() createMuteListDto: CreateMuteListDto) {
    return await this.muteListService.create(createMuteListDto);
  }

  @Get()
  findAll() {
    return this.muteListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.muteListService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMuteListDto: UpdateMuteListDto) {
    return this.muteListService.update(Number(id), updateMuteListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.muteListService.remove(Number(id));
  }
}
