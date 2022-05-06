import { Module } from '@nestjs/common';
import { FriendsListService } from './friends-list.service';
import { FriendsListController } from './friends-list.controller';
import { FriendsList } from './entities/friends-list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FriendsList])],
  controllers: [FriendsListController],
  providers: [FriendsListService]
})
export class FriendsListModule {}
