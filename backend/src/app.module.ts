import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { GamesModule } from './games/games.module';
import { FriendsListModule } from './friends-list/friends-list.module';
import { MuteListModule } from './mute-list/mute-list.module';
import { BlockedListModule } from './blocked-list/blocked-list.module';
import { AdminListModule } from './admin-list/admin-list.module';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from '@hapi/joi';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './pong/pong.module';

@Module({
  imports: [ 
    DatabaseModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
          POSTGRES_HOST: Joi.string().required(),
          POSTGRES_PORT: Joi.number().required(),
          POSTGRES_USER: Joi.string().required(),
          POSTGRES_PASSWORD: Joi.string().required(),
          POSTGRES_DB: Joi.string().required(),
          PORT: Joi.number(),
          API42_CLIENT_ID: Joi.string().required(),
          API42_SECRET: Joi.string().required(),
          TWO_FA_APP_NAME: Joi.string().required(),
          JWT_SECRET_ACCESS: Joi.string().required(),
          JWT_SECRET_REFRESH: Joi.string().required(),
        })
    }),
    GamesModule,
    ChannelsModule,
    FriendsListModule,
    MuteListModule,
    BlockedListModule,
    AdminListModule,
    ChannelsModule,
    AuthModule,
    MessagesModule,
    ChatModule,
	PongModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
