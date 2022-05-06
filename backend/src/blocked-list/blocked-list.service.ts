import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlockedListDto } from './dto/create-blocked-list.dto';
import { UpdateBlockedListDto } from './dto/update-blocked-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity'
import { BlockedList } from './entities/blocked-list.entity';

@Injectable()
export class BlockedListService {
  constructor(
    @InjectRepository(BlockedList)
    private BlockedListsRepository: Repository<BlockedList>
  ) {}
  async create(BlockedList: CreateBlockedListDto) {
    const newBlockedList = await this.BlockedListsRepository.create(BlockedList);
    await this.BlockedListsRepository.save(newBlockedList);
    return newBlockedList;
  }

  findAll() {
    return this.BlockedListsRepository.find({ relations: ['user_blocking', 'user_blocked'] });
  }

  async findMyBlocked(id: number) {
    const blockedList = await this.BlockedListsRepository.find({ where: { user_blocking: id }, relations: ['user_blocked'] });
    if (blockedList) {
      return blockedList;
    }
    throw new HttpException('Friend Requests not found', HttpStatus.NOT_FOUND);
  }

  async findOne(id: number) {
    const BlockedList = await this.BlockedListsRepository.findOne(id);
    if (BlockedList) {
      return BlockedList;
    }
    throw new HttpException('Block Relationship not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateBlockedListDto: UpdateBlockedListDto) {
    const updatedBlockedList = await this.BlockedListsRepository.findOne(id);
    await this.BlockedListsRepository.update(id, updateBlockedListDto);
    if (updatedBlockedList) {
      return updatedBlockedList;
    }
    throw new HttpException('Block Relationship not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this.BlockedListsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Block Relationship not found', HttpStatus.NOT_FOUND);
    }
  }
}
