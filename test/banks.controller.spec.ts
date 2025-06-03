import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { BanksController } from '../src/banks/banks.controller';
import { BanksService } from '../src/banks/banks.service';
import { DatabaseService } from '../src/common/database/database.service';

describe('BanksController', () => {
  let controller: BanksController;

  const dbMock = {
    bankAvailability: {
      findMany:  jest.fn().mockResolvedValue([{ id: 1 }]),
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
    },
  } as unknown as DatabaseService;

  const mockBanksSvc = {
    getAll: jest.fn().mockResolvedValue([{ id: 1 }]),
    getOne: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [BanksController],
      providers: [
        { provide: BanksService, useValue: mockBanksSvc },
        { provide: DatabaseService, useValue: dbMock },
      ],
    }).compile();

    controller = module.get<BanksController>(BanksController);
  });

  it('returns all banks for given window', async () => {
    const res = await controller.getAll({ window: '1h' } as any);
    expect(res.data).toEqual([{ id: 1 }]);
  });

  it('returns one bank by code', async () => {
    const res = await controller.getOne('NIP001', { window: '1h' } as any);
    expect(res.data).toEqual({ id: 1 });
  });
});
