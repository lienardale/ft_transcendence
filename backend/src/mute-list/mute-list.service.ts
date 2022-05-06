import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMuteListDto } from './dto/create-mute-list.dto';
import { UpdateMuteListDto } from './dto/update-mute-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection  } from 'typeorm';
import { User } from '../auth/entities/user.entity'
import { MuteList } from './entities/mute-list.entity';

export interface MuteType {
  id: number;
  friend: User;
};

@Injectable()
export class MuteListService {
  constructor(
    @InjectRepository(MuteList)
    private MuteListsRepository: Repository<MuteList>
  ) {}

  async create(muteList: CreateMuteListDto) {
    const newmuteList = await this.MuteListsRepository.create(muteList);
    await this.MuteListsRepository.save(newmuteList);
    return newmuteList;
  }

  findAll() {
    return this.MuteListsRepository.find({ relations: ['user', 'channel'] });
  }

  async findOne(channelId: number) {
    const muteList = await getConnection()
      .createQueryBuilder()
      .select("mute.user")
      .addSelect("MAX(mute.unmutetime)", "unmutetime")
      .from(MuteList, "mute")
      .where("mute.channel = :id", { id: channelId })
      .groupBy("mute.user")
      .getRawMany();

    return muteList;
  }

  async update(id: number, updateMuteListDto: UpdateMuteListDto) {
    const updatedMuteList = await this.MuteListsRepository.findOne(id);
    await this.MuteListsRepository.update(id, updateMuteListDto);
    if (updatedMuteList) {
      return updatedMuteList;
    }
    throw new HttpException('Friend Relationship not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this.MuteListsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Friend Relationship not found', HttpStatus.NOT_FOUND);
    }
  }
}
