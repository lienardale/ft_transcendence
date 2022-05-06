import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity'

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.gamesRepository.find({ relations: ['userPlayer1', 'userPlayer2'] });
  }

  async create(createGameDto: CreateGameDto) {
    const newGame = this.gamesRepository.create(createGameDto);
    
    await this.gamesRepository.save(newGame);
    return newGame;
  }

  async findOne(id: number) {
    const game = await this.gamesRepository.findOne(id);
    if (game) {
      return game;
    }
    throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, game: UpdateGameDto) {
    const updatedGame = await this.gamesRepository.findOne(id);
    await this.gamesRepository.update(id, game);
    if (updatedGame) {
      return updatedGame
    }
    throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this.gamesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
  }
}
