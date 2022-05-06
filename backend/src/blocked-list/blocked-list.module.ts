import { Module } from '@nestjs/common';
import { BlockedListService } from './blocked-list.service';
import { BlockedListController } from './blocked-list.controller';
import { BlockedList } from './entities/blocked-list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedList])],
  controllers: [BlockedListController],
  providers: [BlockedListService]
})
export class BlockedListModule {}
