import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { GetPasswordDto } from './dto/getPasswordDto.dto';
import { Channel } from './entities/channel.entity';
import { ChannelFull } from './entities/channelFull.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, Brackets, Not} from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { BlockedList } from '../blocked-list/entities/blocked-list.entity';
import { UserStatus } from 'src/auth/helpers/user.status.enum';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private ChannelsRepository: Repository<Channel>,
    private authenticationService: AuthService,
  ) {}

  async findAllOwned(userId: number) {//remettre avec GetUser quand protections seront de nouveau en place
    return await this.ChannelsRepository.find({ where: { user_owner: userId, channel_type : Not('pm') }, relations: ['user_owner'] });
  }

  async findAllPublic() {
    return await this.ChannelsRepository.find({ where: { channel_type: 'public' } });
  }

  async findPublicPrivate() {
    return await this.ChannelsRepository.find({ where: [{ channel_type: 'public' }, { channel_type: 'private' }], relations: ['user_owner'] });
  }

  public async checkPassword(getPasswordDto: GetPasswordDto): Promise<boolean> {
    let result: boolean = true;
    const getChannel= await this.ChannelsRepository.findOne(getPasswordDto.channelId);
    return ((getChannel.password === getPasswordDto.code));        
}

  async findAllBannedChannel(userId: number) {
    const bannedList = await getConnection()
    .createQueryBuilder()
    .select("channel.id")
    .from(Channel, "channel")
    .leftJoin("channel.banned", "banned")
    .where("banned.id = :id", { id: userId })
    .getMany();
    
    return bannedList;
  }

  async findAllMine(userId: number) {
    const blockedList = await getConnection()
      .createQueryBuilder()
      .select("block.userBlockingId AS ID")
      .from(BlockedList, "block")
      .where("block.userBlockedId = :id", { id: userId });

    const blockindList = await getConnection()
    .createQueryBuilder()
    .select("block.userBlockedId AS ID")
    .from(BlockedList, "block")
    .where("block.userBlockingId = :id", { id: userId });

    const ChannelList = await getConnection()
    .createQueryBuilder()
    .select("channel.id")
    .from(Channel, "channel")
    .leftJoin("channel.members", "user_member")
    .andWhere("channel.channel_type = 'pm'")
    .andWhere(new Brackets(qb => {
      qb.where("user_member.id IN (" + blockedList.getQuery() + ")")
        .orWhere("user_member.id IN (" + blockindList.getQuery() + ")")
    }))
    .setParameters(blockedList.getParameters())
    .setParameters(blockindList.getParameters())
    
    const channelsSQL = await getConnection()
      .createQueryBuilder()
      .select("channel")
      .from(Channel, "channel")
      .leftJoinAndSelect("channel.user_owner", "user_owner")
      .leftJoin("channel.members", "user_member")
      .where("user_member.id = :id", { id: userId })
      .andWhere("channel.id NOT IN (" + ChannelList.getQuery() + ")")
      .setParameters(ChannelList.getParameters())
      .getMany();
    
    return channelsSQL;
  }

  async findAllAdmins(id: number) {
    const channel = await this.ChannelsRepository.findOne(id);
    const admins = await getConnection()
      .createQueryBuilder()
      .relation(Channel, "admins")
      .of(channel)
      .loadMany();
    return admins;
  }

  async findAllMembers(id: number) {
    const channel = await this.ChannelsRepository.findOne(id);
    const members = await getConnection()
      .createQueryBuilder()
      .relation(Channel, "members")
      .of(channel)
      .loadMany();
    return members;
  }

  async findAllMembersAndBanned(id: number) {
    const channel = await this.ChannelsRepository.findOne(id);
    const members = await getConnection()
      .createQueryBuilder()
      .relation(Channel, "members")
      .of(channel)
      .loadMany();
      const banned = await getConnection()
      .createQueryBuilder()
      .relation(Channel, "banned")
      .of(channel)
      .loadMany();
    return members.concat(banned);
  }

  findAllPrivate() {
    return this.ChannelsRepository.find({ where: { channel_type: 'private' } });
  }

  findAllPM() {
    return this.ChannelsRepository.find({ where: { channel_type: 'pm' }, relations: ['user_owner'] });
  }

  findAllMember() {
    return this.ChannelsRepository.find({ where: { channel_type: 'private' } });
  }

  async findOne(id: number) {
    const Channel = await this.ChannelsRepository.findOne(
      id, 
      { relations: ['user_owner', 'messages', 'messages.user_writer'] 
    });
    if (Channel) {
      return Channel;
    }
    throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
  }

  async findOneSelected(id: number) {
    const Channel = await this.ChannelsRepository.findOne(
      id, 
      { 
        select : ["id", "channel_type", "name", "id_pm", "hasPassword"],
        relations: ['user_owner', 'admins', 'members', 'banned', 'mute', 'mute.user', 'messages', 'messages.user_writer'] 
    });
    if (Channel) {
      return Channel;
    }
    throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
  }

  async findAllForMe(userId: number) {
    const blockedList = await getConnection()
    .createQueryBuilder()
    .select("block.userBlockedId AS ID")
    .from(BlockedList, "block")
    .where("block.userBlockingId = :id", { id: userId });

    const allMembersForMe = await getConnection()
    .createQueryBuilder()
    .select("channel.id")
    .addSelect("MAX(CASE WHEN members.id = " + userId + " THEN 1 ELSE 0 END) iAmMember")
    .addSelect("MAX(CASE WHEN banned.id = " + userId + " THEN 1 ELSE 0 END) iAmBanned")
    .addSelect("MAX(CASE WHEN channel.channel_type = 'pm' and members.id  IN (" + blockedList.getQuery() + ") THEN 1 ELSE 0 END) iBlock")
    .from(Channel, "channel")
    .leftJoin("channel.members", "members")
    .leftJoin("channel.banned", "banned")
    .groupBy("channel.id")
    .setParameters(blockedList.getParameters())
    ;

   const allChannelsForMe = await getConnection()
    .createQueryBuilder()
    .select("channel")
    .from(Channel, "channel")
    .leftJoinAndSelect("(" + allMembersForMe.getQuery() + ")", "members", "members.channel_id = channel.id")
    .orderBy("channel.id")
    .setParameters(allMembersForMe.getParameters())
    .getRawMany();
    ;
    
    const object = allChannelsForMe.map((s: any) => {
            const item : ChannelFull = {
                id: s.channel_id,
                channel_type : s.channel_channel_type,
                id_pm : s.channel_id_pm,
                name : s.channel_name,
                hasPassword : s.channel_hasPassword,
                userOwnerId : s.channel_userOwnerId,
                iAmMember : s.iammember,
                iAmBanned : s.iambanned,
                iBlock : s.iblock,
            };
            return item;
        });
  
  return object;

  }

  async create(Channel: CreateChannelDto) {
    const newChannel = await this.ChannelsRepository.create(Channel);
    const owner = await this.authenticationService.getUserById(Number(newChannel.user_owner));
    newChannel.admins = [owner];
    newChannel.members = [owner];
    await this.ChannelsRepository.save(newChannel);
    return newChannel;
  }

  async update(id: number, Channel: UpdateChannelDto) {
    await this.ChannelsRepository.update(id, Channel);
    const updatedChannel = await this.ChannelsRepository.findOne(id);
    if (updatedChannel) {
      return updatedChannel
    }
    throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
  }

  async updateOwner(id_channel: number, user: User) {
      await getConnection()
      .createQueryBuilder()
      .relation(Channel, "user_owner")
      .of(id_channel)
      .set(user)
  }

  async addMember(id_channel: number, id_user: number) {
    await getConnection()
      .createQueryBuilder()
      .relation(Channel, "members")
      .of(id_channel)
      .addAndRemove(id_user, id_user)
  }

  async addAdmin(id_channel: number, id_user: number) {
    await getConnection()
      .createQueryBuilder()
      .relation(Channel, "admins")
      .of(id_channel)
      .addAndRemove(id_user, id_user)
  }

  async addBanned(id_channel: number, id_user: number) {
    await getConnection()
      .createQueryBuilder()
      .relation(Channel, "banned")
      .of(id_channel)
      .addAndRemove(id_user, id_user)
  }

  async deleteMember(id_channel: number, id_user: number) {
    await getConnection()
      .createQueryBuilder()
      .relation(Channel, "members")
      .of(id_channel)
      .remove(id_user)
  }

  async removeAdmin(id_channel: number, id_user: number) {
    await getConnection()
      .createQueryBuilder()
      .relation(Channel, "admins")
      .of(id_channel)
      .remove(id_user)
  }

  async remove(id: number) {
    const deleteResponse = await this.ChannelsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    }
  }

  async setUserOnAway(id: number) {
    const user = await this.authenticationService.getUserById(id);
    return await this.authenticationService.updateUser({
        status: UserStatus.AWAY
      }
      , user);
  }

  async setUserOnSearching(id: number) {
    const user = await this.authenticationService.getUserById(id);
    return await this.authenticationService.updateUser({
        status: UserStatus.SEARCHING
      }
      , user);
  }

  async cancelUserSearching(id: number) {
    const user = await this.authenticationService.getUserById(id);
    return await this.authenticationService.updateUser({
        status: UserStatus.CONNECTED
      }
      , user);
  }

  async setUserOnGaming(id: number) {
    const user = await this.authenticationService.getUserById(id);
    return await this.authenticationService.updateUser({
        status: UserStatus.GAMING
      }
      , user);
  }

  async setUserOnConnected(id: number) {
    const user = await this.authenticationService.getUserById(id);
    return await this.authenticationService.updateUser({
        status: UserStatus.CONNECTED
      }
      , user);
  }
}