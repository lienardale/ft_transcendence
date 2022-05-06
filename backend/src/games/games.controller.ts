import { Controller, Get, Post, Body, Req, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GetUser } from '../auth/helpers/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import JwtGuard from 'src/auth/strategies/jwt.guard';

@Controller('games')
@UseGuards(JwtGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto/*, userPlayer2Id*/);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(Number(id), updateGameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(Number(id));
  }
}
