import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { ChannelsModule } from 'src/channels/channels.module';
import { ChannelsService } from 'src/channels/channels.service';
import { ChatGateway } from './chat.gateway';
import { Channel } from '../channels/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    AuthModule,
    ChannelsModule,
    HttpModule,
    ChatModule,
  ],
  controllers: [],
  providers: [ChatService, AuthService, ChannelsService, ChatGateway]
})
export class ChatModule {}
