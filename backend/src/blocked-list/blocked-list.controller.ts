import { Controller, Get, Post, Body, Req, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { BlockedListService } from './blocked-list.service';
import { CreateBlockedListDto } from './dto/create-blocked-list.dto';
import { UpdateBlockedListDto } from './dto/update-blocked-list.dto';
import JwtGuard from 'src/auth/strategies/jwt.guard';

@Controller('blocked-list')
@UseGuards(JwtGuard)
export class BlockedListController {
  constructor(private readonly blockedListService: BlockedListService) {}

  @Post()
  create(@Body() createBlockedListDto: CreateBlockedListDto,) {
    return this.blockedListService.create(createBlockedListDto);
  }

  @Get()
  findAll() {
    return this.blockedListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockedListService.findOne(+id);
  }

  @Get('/blocked/:id')
  findMyBlocked(@Param('id') id: string) {
    return this.blockedListService.findMyBlocked(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockedListDto: UpdateBlockedListDto) {
    return this.blockedListService.update(+id, updateBlockedListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockedListService.remove(+id);
  }
}
