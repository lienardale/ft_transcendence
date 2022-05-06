import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FriendsListService } from './friends-list.service';
import { CreateFriendsListDto } from './dto/create-friends-list.dto';
import { UpdateFriendsListDto } from './dto/update-friends-list.dto';
import JwtGuard from 'src/auth/strategies/jwt.guard';

@Controller('friends-list')
@UseGuards(JwtGuard)
export class FriendsListController {
  constructor(private readonly friendsListService: FriendsListService) {}

  @Post()
  create(@Body() createFriendsListDto: CreateFriendsListDto) {
    return this.friendsListService.create(createFriendsListDto);
  }

  @Get()
  findAll() {
    return this.friendsListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendsListService.findOne(Number(id));
  }

  @Get('/friends-asked/:id')
  findMyFriendsAsked(@Param('id') id: string) {
    return this.friendsListService.findMyFriendsAsked(Number(id));
  }

  @Get('/friends-asking/:id')
  findMyFriendsAsking(@Param('id') id: string) {
    return this.friendsListService.findMyFriendsAsking(Number(id));
  }

  @Get('/friends/:id')
  findMyFriefindMyFriendsndsAsking(@Param('id') id: string) {
    return this.friendsListService.findMyFriends(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendsListDto: UpdateFriendsListDto) {
    return this.friendsListService.update(Number(id), updateFriendsListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsListService.remove(Number(id));
  }
}
