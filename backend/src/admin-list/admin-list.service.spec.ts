import { Test, TestingModule } from '@nestjs/testing';
import { AdminListService } from './admin-list.service';

describe('AdminListService', () => {
  let service: AdminListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminListService],
    }).compile();

    service = module.get<AdminListService>(AdminListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
