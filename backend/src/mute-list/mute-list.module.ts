import { Module } from '@nestjs/common';
import { MuteListService } from './mute-list.service';
import { MuteListController } from './mute-list.controller';
import { MuteList } from './entities/mute-list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MuteList])],
  controllers: [MuteListController],
  providers: [MuteListService]
})
export class MuteListModule {}
