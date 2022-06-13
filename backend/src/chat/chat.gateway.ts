import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { UserStatus } from 'src/auth/helpers/user.status.enum';
import { Channel } from 'src/channels/entities/channel.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
      private chatService: ChatService,
  ) {}

  private logger: Logger = new Logger('ChatGateway');
  
  /******* GAME INVITATION ********/

  @SubscribeMessage('acceptNewGame')
  handleNewAcceptedGame(client: Socket, payload: string): void {
    this.logger.log(`NewAcceptedGame`);
    this.server.emit('NewAcceptedGame', payload);
  }

  @SubscribeMessage('askGame')
  async handleAskGame(client: Socket, payload: { id_asked : number; id_asking : number; login_asking : string } ): Promise<void> {
    this.logger.log(`User ${payload.id_asking} alias ${payload.login_asking} asked user ${payload.id_asked} for a game`);
    await this.chatService.setUserOnSearching(payload.id_asking);
    await this.chatService.setUserOnSearching(payload.id_asked);
    this.server.emit('askGameToClient', { id_asked : payload.id_asked, id_asking : payload.id_asking, login_asking : payload.login_asking  });
    this.server.emit('majLogins', payload.id_asking);
  }
  
  @SubscribeMessage('cancelGame')
  async handleCancelGame(client: Socket, payload: { id_asked : number; id_asking : number; login_asking : string } ): Promise<void> {
    this.logger.log(`User ${payload.id_asking} alias ${payload.login_asking} cancel his game invite for user ${payload.id_asked}`);
    this.server.emit('cancelGameToClient', { id_asked : payload.id_asked });
    await this.chatService.setUserOnConnected(payload.id_asking);
    await this.chatService.setUserOnConnected(payload.id_asked);
    this.server.emit('majLogins', payload.id_asking);
  }  

  @SubscribeMessage('startGame')
  async handleStartGame(client: Socket, payload: { id_p1 : number; id_p2 : number} ): Promise<void> {
    this.logger.log(`User ${payload.id_p1} and user ${payload.id_p2} start a game`);
    await this.chatService.setUserOnGaming(payload.id_p1);
    await this.chatService.setUserOnGaming(payload.id_p2);
    this.server.emit('majLogins', payload.id_p1);
    this.server.emit('majLogins', payload.id_p2);
  }  

  @SubscribeMessage('searchGame')
  async handleSearchGame(client: Socket, payload: { id_user : number} ): Promise<void> {
    this.logger.log(`User ${payload.id_user} search for a game`);
    await this.chatService.setUserOnSearching(payload.id_user);
    this.server.emit('majLogins', payload.id_user);
  }  

  @SubscribeMessage('cancelSearchGame')
  async handleCancelSearchGame(client: Socket, payload: { id_user : number} ): Promise<void> {
    this.logger.log(`User ${payload.id_user} cancelled search for a game`);
    await this.chatService.cancelUserSearching(payload.id_user);
    this.server.emit('majLogins', payload.id_user);
  } 

  @SubscribeMessage('refuseGame')
  async handleRefuseGame(client: Socket, payload: { id_p1 : number; id_p2 : number} ): Promise<void> {
    this.logger.log(`User ${payload.id_p1} and user ${payload.id_p2} don't start a game`);
    const p1 = await this.chatService.getUserById(payload.id_p1);
    this.server.emit('cancelGameToClient', { id_asked : payload.id_p1 });
    if (p1.status === UserStatus.SEARCHING) {
      await this.chatService.setUserOnConnected(payload.id_p1);
    }
    await this.chatService.setUserOnConnected(payload.id_p2);
    this.server.emit('majLogins', payload.id_p1);
  }  

  /******* CHAT ********/

  @SubscribeMessage('channelToServer')
  async handleChannel(client: Socket, payload: string): Promise<void> {
    this.logger.log(`NewChannel`, payload);
    const channelFromClient: Channel = JSON.parse(payload);
    this.server.emit('majChannels', channelFromClient.id);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: { content : string; room : string} ): void {
    this.logger.log(`Room ${payload.room} receives ${payload.content}`);
    this.server.to(payload.room.toString()).emit('majChannelSelected', payload.room);
  }

  @SubscribeMessage('changeRoom')
  async handleRoomChange(client: Socket, payload: { id_old_channel : number; id_new_channel : number; id_user : number } ) {
    await client.leave(payload.id_old_channel.toString());
    this.logger.log(`Client ${payload.id_user} / ${client.id} leaves room ${payload.id_old_channel}`);
    client.join(payload.id_new_channel.toString());
    this.logger.log(`Client ${payload.id_user} / ${client.id} joins room ${payload.id_new_channel}`);
    await this.chatService.addUser(payload.id_new_channel, payload.id_user);
    this.logger.log(`Client ${client.id} added`);
    this.server.to(payload.id_new_channel.toString()).emit('majChannelSelected', payload.id_new_channel);
    this.server.emit('majChannels', payload.id_new_channel);
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(client: Socket, payload: { id_channel : number; id_user : number } ) {
    client.join(payload.id_channel.toString());
    this.logger.log(`Client ${payload.id_user} / ${client.id} joins room ${payload.id_channel}`);
    await this.chatService.addUser(payload.id_channel, payload.id_user);
    this.logger.log(`Client ${client.id} added`);
    this.server.to(payload.id_channel.toString()).emit('majChannelSelected', payload.id_channel);
    this.server.emit('majChannels', payload.id_channel);
  }

  @SubscribeMessage('leaveRoom')
  async handleRoomLeave(client: Socket, room: string ) {
    await client.leave(room.toString());
    this.logger.log(`Client ${client.id} leaves room ${room}`);
  }

  @SubscribeMessage('majLoginsServer')
  handlemajLogins(client: Socket, payload: { id_user : number } ) {
    this.server.emit('majLogins', payload.id_user);
    this.logger.log(`majLogins ${payload.id_user}`);
  }

  @SubscribeMessage('majAvatarServer')
  handlemajAvatar(client: Socket, payload: { id_user : number } ) {
    this.server.emit('majAvatar', payload.id_user);
    this.logger.log(`majAvatar ${payload.id_user}`);
  }

  @SubscribeMessage('majChannelServer')
  handleDeleteChannel(client: Socket ) {
    this.server.emit('majChannels');
    this.logger.log(`majChannels`);
  }

  @SubscribeMessage('majChannelSelectedToServer')
  handleNewMute(client: Socket, payload: string ): void {
    this.server.to(payload.toString()).emit('majChannelSelected', payload);
    this.logger.log(`majChannelSelectedToServer for : ${payload}`);
  }  

  @SubscribeMessage('addMember')
  async handleAddMember(client: Socket, payload: { id_channel : number; id_user : number } ) {
    this.logger.log(`Client ${payload.id_user} need to be added to channel ${payload.id_channel}`);
    await this.chatService.addUser(payload.id_channel, payload.id_user);
    this.logger.log(`Client ${payload.id_user} added to channel ${payload.id_channel}`);
    this.server.to(payload.id_channel.toString()).emit('majChannelSelected', payload.id_channel);
    this.server.emit('majChannels', payload.id_channel);
  }

  @SubscribeMessage('removeMember')
  async handleRemoveMember(client: Socket, payload: { id_channel : number; id_user : number } ) {
    this.logger.log(`Client ${payload.id_user} is leaving channel ${payload.id_channel}`);
    await this.chatService.removeUser(payload.id_channel, payload.id_user);
    try {
      await this.chatService.getChannel(payload.id_channel);
      this.server.emit('majChannels', payload.id_channel);
      this.server.to(payload.id_channel.toString()).emit('majChannelSelected', payload.id_channel);
    } catch (error) {
      this.server.emit('supChannel', payload.id_channel);
    }
  }

  @SubscribeMessage('addAdmin')
  async handleAdmin(client: Socket, payload: { id_channel : number; id_user : number } ) {
    this.logger.log(`Client ${payload.id_user} need to be added as Administrator to channel ${payload.id_channel}`);
    await this.chatService.addAdmin(payload.id_channel, payload.id_user);
    this.logger.log(`Client ${payload.id_user} added as Administrator to channel ${payload.id_channel}`);
    this.server.to(payload.id_channel.toString()).emit('majChannelSelected', payload.id_channel);
  }

  @SubscribeMessage('removeAdmin')
  async handleRemoveAdmin(client: Socket, payload: { id_channel : number; id_user : number } ) {
    this.logger.log(`Client ${payload.id_user} need to be removed his administrator roles on channel ${payload.id_channel}`);
    await this.chatService.removeAdmin(payload.id_channel, payload.id_user);
    this.logger.log(`Client ${payload.id_user} is removed his administrator roles on channel ${payload.id_channel}`);
    try {
      await this.chatService.getChannel(payload.id_channel);
      this.server.to(payload.id_channel.toString()).emit('majChannelSelected', payload.id_channel);
    } catch (error) {
      this.server.emit('supChannel', payload.id_channel);
    }
  }

  @SubscribeMessage('addBanned')
  async handleAddBanned(client: Socket, payload: { id_channel : number; id_user : number } ) {
    this.logger.log(`Client ${payload.id_user} need to be banned from channel ${payload.id_channel}`);
    await this.chatService.addBanned(payload.id_channel, payload.id_user);
    this.logger.log(`Client ${payload.id_user} banned from channel ${payload.id_channel}`);
    this.server.to(payload.id_channel.toString()).emit('majChannelSelected', payload.id_channel);
  }

  @SubscribeMessage('majPMServer')
  async handlemajPM(client: Socket, payload: { id_user : number } ) {
    const channels = await this.chatService.getPMChannels();
    channels.forEach((channel : Channel) => {
      //this.logger.log(`PM : ${channel.user_owner.id} | ${channel.id_pm}`);
      if (channel.user_owner.id === payload.id_user || channel.id_pm === payload.id_user) {
        this.server.to(channel.id.toString()).emit('majChannelSelected', channel.id);
      }
    })
  }

  /******* FRIENDS ********/

  @SubscribeMessage('newFriendRequestToServer')
  handlenewFriendRequest(client: Socket, payload: { id_user_asking : number ; id_user_asked : number } ): void {
    this.server.emit('newFriendRequestToClient', { id_user_asking : payload.id_user_asking, id_user_asked : payload.id_user_asked });
    this.logger.log(`User ${payload.id_user_asked} has a new Request : ${payload.id_user_asking}`);
  }

  /******* ADMIN VIEW ********/
  
  @SubscribeMessage('addWebBanned')
  handleAddWebBanned(client: Socket, payload: { id_user : number } ): void {
    this.server.emit('newWebBanned', { id_user : payload.id_user });
    this.logger.log(`New web banned user: ${payload.id_user}`);
    this.server.emit('majLogins');
  }  

  @SubscribeMessage('removeWebBanned')
  handleRemoveWebBanned(client: Socket, payload: { id_user : number } ): void {
    this.server.emit('deleteWebBanned', { id_user : payload.id_user });
    this.logger.log(`Delete web banned user: ${payload.id_user}`);
  }

  @SubscribeMessage('addWebAdmin')
  handleAddWebAdmin(client: Socket, payload: { id_user : number } ): void {
    this.server.emit('newWebAdmin', { id_user : payload.id_user });
    this.logger.log(`New web admin user: ${payload.id_user}`);
    this.server.emit('majLogins');
  }  

  @SubscribeMessage('removeWebAdmin')
  handleRemoveWebAdmin(client: Socket, payload: { id_user : number } ): void {
    this.server.emit('deleteWebAdmin', { id_user : payload.id_user });
    this.logger.log(`Delete web admin user: ${payload.id_user}`);
  } 

  @SubscribeMessage('changeWebAdminRoom')
  async handleWebAdminRoom(client: Socket, payload: { id_old_channel : number; id_new_channel : number; id_user : number } ) {
    await client.leave(payload.id_old_channel.toString());
    this.logger.log(`Client ${payload.id_user} / ${client.id} leaves room ${payload.id_old_channel}`);
    client.join(payload.id_new_channel.toString());
    this.logger.log(`Client ${payload.id_user} / ${client.id} joins room ${payload.id_new_channel}`);
    this.server.to(payload.id_new_channel.toString()).emit('majChannelSelected', payload.id_new_channel);
    this.server.emit('majChannels', payload.id_new_channel);
  }

  /******* (DE)CONNEXION ********/

  afterInit(server: Server) {
    this.logger.log(`Init`);
  }

  async handleDisconnect(client: Socket, ...args: any[]) {
    const userId: string = client.handshake.auth.id_user;
    await this.chatService.setUserOnAway(Number(userId));
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit('majLogins', userId);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    let user_id;
    try {
      const user = await this.chatService.getUserFromSocket(client);
      await this.chatService.setUserOnConnected(user.id);
      user_id = user.id;
    }
    catch (e) {
      this.logger.log(`${e}`);
      client.disconnect();
    }
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('majLogins', user_id);
  }

  @SubscribeMessage('connect user')
  async handleConnectFromDB(client: Socket, payload: { id_user : number }) {
    await this.chatService.setUserOnConnected(payload.id_user);
    this.server.emit('majLogins', payload.id_user);
  }

}
