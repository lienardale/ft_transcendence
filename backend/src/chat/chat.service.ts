import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ChannelsService } from 'src/channels/channels.service';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    private channelService: ChannelsService,
    private authService: AuthService
  ) {}

  private logger: Logger = new Logger('ChatGateway');

  async addUser(id_channel: number, id_user: number) {
    await this.channelService.addMember(id_channel, id_user);
  }

  async addAdmin(id_channel: number, id_user: number) {
    await this.channelService.addAdmin(id_channel, id_user);
  }

  async addBanned(id_channel: number, id_user: number) {
    await this.channelService.addBanned(id_channel, id_user);
  }

  async removeUser(id_channel: number, id_user: number) {
    await this.channelService.deleteMember(id_channel, id_user);
    const members = await this.channelService.findAllMembers(id_channel);
    const channel = await this.getChannel(id_channel);

    if (members.length === 0) {
      await this.channelService.remove(id_channel);
    } else if (channel.user_owner.id === id_user) {
      await this.channelService.removeAdmin(id_channel, id_user);
      const admins = await this.channelService.findAllAdmins(id_channel);
      if (admins.length === 0) {
        await this.channelService.updateOwner(id_channel, members[0]);
        await this.channelService.addAdmin(id_channel, members[0]);
      } else {
        await this.channelService.updateOwner(id_channel, admins[0]);
      }
    }
  }

  async removeAdmin(id_channel: number, id_user: number) {
    await this.channelService.removeAdmin(id_channel, id_user);
    const members = await this.channelService.findAllMembers(id_channel);
    const admins = await this.channelService.findAllAdmins(id_channel);
    const channel = await this.getChannel(id_channel);
   
    if (channel.user_owner.id === id_user) {
      if (members.length === 1 && members[0].id === id_user) {
        await this.removeUser(id_channel, id_user);
      } else if (admins.length === 0 && members.length !== 0) {
        await this.channelService.updateOwner(id_channel, members[0]);
        await this.channelService.addAdmin(id_channel, members[0]);
      } else if (admins.length === 0 && members.length === 0) {
        await this.channelService.remove(id_channel);
      } else if (admins.length !== 0) {
        await this.channelService.updateOwner(id_channel, admins[0]);
      }
    }
  }

  async getChannel(id_channel: number) {
    return await this.channelService.findOne(id_channel);
  }

  async getPMChannels() {
    return await this.channelService.findAllPM();
  }

  async getUserById(id_user: number) {
    return await this.authService.getUserById(id_user);
  }

  async setUserOnAway(id_user: number) {
    return await this.channelService.setUserOnAway(id_user);
  }

  async setUserOnSearching(id_user: number) {
    return await this.channelService.setUserOnSearching(id_user);
  }

  async cancelUserSearching(id_user: number) {
    return await this.channelService.cancelUserSearching(id_user);
  }

  async setUserOnGaming(id_user: number) {
    return await this.channelService.setUserOnGaming(id_user);
  }

  async setUserOnConnected(id_user: number) {
    return await this.channelService.setUserOnConnected(id_user);
  }

  async getUserFromSocket(socket: Socket) : Promise<User> {
    const token: string = socket.handshake.auth.token;
	//this.logger.log("chat");
	//this.logger.log(socket.handshake);
    if (token === undefined) { 
      throw new WsException("Invalid credentials");
    }
    const user = await this.authService.getUserFromAuthenticationToken(token);
    if (!user) {
      throw new WsException("Invalid credentials");
    }
    return user;
  }

  async setUserAwayFromSocket(socket: Socket) {
    const token: string = socket.handshake.auth.token;
    if (token === undefined) { 
      throw new WsException("Invalid credentials");
    }
    const user = await this.authService.getUserFromAuthenticationToken(token);
    if (!user) {
      throw new WsException("Invalid credentials");
    }
    await this.authService.removeRefreshToken(user);
    return await this.channelService.setUserOnAway(user.id);
  }
}
