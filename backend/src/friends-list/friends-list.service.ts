import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFriendsListDto } from './dto/create-friends-list.dto';
import { UpdateFriendsListDto } from './dto/update-friends-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection  } from 'typeorm';
import { User } from '../auth/entities/user.entity'
import { FriendsList } from './entities/friends-list.entity';

export interface FriendsType {
  id: number;
  friend: User;
};

@Injectable()
export class FriendsListService {
  constructor(
    @InjectRepository(FriendsList)
    private FriendsListsRepository: Repository<FriendsList>
  ) {}

  async create(friendsList: CreateFriendsListDto) {
    const newfriendsList = await this.FriendsListsRepository.create(friendsList);
    await this.FriendsListsRepository.save(newfriendsList);
    return newfriendsList;
  }

  findAll() {
    return this.FriendsListsRepository.find({ relations: ['user_asked', 'user_asking'] });
  }

  async findOne(id: number) {
    const friendsList = await this.FriendsListsRepository.findOne(id);
    if (friendsList) {
      return friendsList;
    }
    throw new HttpException('Friend Relationship not found', HttpStatus.NOT_FOUND);
  }

  async findMyFriendsAsked(id: number) {
    const friendsList = await this.FriendsListsRepository.find({ where: { friendship_status: 'not_accepted', user_asking: id }, relations: ['user_asked'] });
    if (friendsList) {
      return friendsList;
    }
    throw new HttpException('Friend Requests not found', HttpStatus.NOT_FOUND);
  }

  async findMyFriendsAsking(id: number) {
    const friendsList = await this.FriendsListsRepository.find({ where: { friendship_status: 'not_accepted', user_asked: id }, relations: ['user_asking'] });
    if (friendsList) {
      return friendsList;
    }
    throw new HttpException('Friend Requests not found', HttpStatus.NOT_FOUND);
  }

  async findMyFriends(id: number) {
    const friendsList = await getConnection()
      .createQueryBuilder()
      .select("friendslist.id")
      .addSelect("friend.id")
      .addSelect("friend.email")
      .addSelect("friend.login")
      .addSelect("friend.avatar_path")
      .addSelect("friend.status")
      .addSelect("friend.level")
      .from(FriendsList, "friendslist")
      .leftJoin("friendslist.user_asking", "friend")
      .where("friendslist.friendship_status = :friendship_status", { friendship_status: "accepted" })
      .andWhere("friendslist.user_asked = :user_asked", { user_asked: id })
      .getRawMany();

      const friendsList2 = await getConnection()
      .createQueryBuilder()
      .select("friendslist.id")
      .addSelect("friend.id")
      .addSelect("friend.email")
      .addSelect("friend.login")
      .addSelect("friend.avatar_path")
      .addSelect("friend.status")
      .addSelect("friend.level")
      .from(FriendsList, "friendslist")
      .leftJoin("friendslist.user_asked", "friend")
      .where("friendslist.friendship_status = :friendship_status", { friendship_status: "accepted" })
      .andWhere("friendslist.user_asking = :user_asking", { user_asking: id })
      .getRawMany();

    if (friendsList.concat(friendsList2)) {
      return friendsList.concat(friendsList2);
    }
    throw new HttpException('Friends not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateFriendsListDto: UpdateFriendsListDto) {
    const updatedFriendsList = await this.FriendsListsRepository.findOne(id);
    await this.FriendsListsRepository.update(id, updateFriendsListDto);
    if (updatedFriendsList) {
      return updatedFriendsList;
    }
    throw new HttpException('Friend Relationship not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this.FriendsListsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Friend Relationship not found', HttpStatus.NOT_FOUND);
    }
  }
}
