import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/helpers/get-user.decorator';
import { GetPasswordDto } from './dto/getPasswordDto.dto';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import JwtGuard from 'src/auth/strategies/jwt.guard';

@Controller('channels')
@UseGuards(JwtGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get('/all/:id')
  async findAllForMe(@Param('id') id: string) {
    return await this.channelsService.findAllForMe(Number(id));
  }
  
  @Post()
  createChannnel(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.create(createChannelDto);
  }

  @Get('/mine')
  async findAllMine(@GetUser() user: User) {
    return await this.channelsService.findAllMine(user.id);
  }

  @Get('/owned')
  async findAllOwned(@GetUser() user: User) {
    return await this.channelsService.findAllOwned(user.id);
  }

  @Get('/banned')
  async findAllBannedChannel(@GetUser() user: User) {
    return await this.channelsService.findAllBannedChannel(user.id);
  }


  @Post('/check-password')
  async checkPassword(@Body() getPasswordDto: GetPasswordDto) : Promise<{ result: boolean }> {
    const res = await this.channelsService.checkPassword(getPasswordDto);
    return ({ result: res});
  }

  @Get('/public')
  async findAllPublic() {
    return await this.channelsService.findAllPublic();
  }

  @Get('/public-private')
  async findPublicPrivate() {
    return await this.channelsService.findPublicPrivate();
  }

  @Get('/findAllAdmins/:id')
  async findAllAdmins(@Param('id') id: string) {
    return await this.channelsService.findAllAdmins(Number(id));
  }

  @Get('/findAllMembers/:id')
  async findAllMembers(@Param('id') id: string) {
    return await this.channelsService.findAllMembers(Number(id));
  }

  @Get('/findAllMembersAndBanned/:id')
  async findAllMembersAndBanned(@Param('id') id: string) {
    return await this.channelsService.findAllMembersAndBanned(Number(id));
  }

  @Get('/private')
  findAllPrivate() {
    return this.channelsService.findAllPrivate();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(Number(id));
  }

  @Get('/selected/:id')
  async findOneSelected(@Param('id') id: string) {
    return await this.channelsService.findOneSelected(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelsService.update(Number(id), updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(Number(id));
  }
}
