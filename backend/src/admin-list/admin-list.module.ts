import { Module } from '@nestjs/common';
import { AdminListService } from './admin-list.service';
import { AdminListController } from './admin-list.controller';

@Module({
  controllers: [AdminListController],
  providers: [AdminListService]
})
export class AdminListModule {}
