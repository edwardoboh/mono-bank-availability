import { Test } from '@nestjs/testing';
import { AvailabilityService } from '../src/availability/availability.service';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from '../src/transaction-source/transaction-source.service';
import { DatabaseService } from '../src/common/database/database.service';
import { SchedulerRegistry } from '@nestjs/schedule';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  const configMock = {
    get: (key: string) => {
      if (key === 'bankCodes') return ['NIP001'];
      if (key === 'pollingMs.1h') return 30000;
      if (key === 'pollingMs.6h') return 90000;
      if (key === 'pollingMs.24h') return 360000;
      if (key === 'confidence.lowMax') return 10;
      if (key === 'confidence.medMax') return 50;
      return undefined;
    },
  } as unknown as ConfigService;

  const txMock = {
    getStatusCounts: jest.fn(),
  } as unknown as TransactionService;

  const dbMock = {
    bankAvailability: {
      upsert: jest.fn().mockResolvedValue(undefined),
    },
  } as unknown as DatabaseService;

  const schedulerMock = {
    addInterval: jest.fn(),
  } as unknown as SchedulerRegistry;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: ConfigService, useValue: configMock },
        { provide: TransactionService, useValue: txMock },
        { provide: DatabaseService, useValue: dbMock },
        { provide: SchedulerRegistry, useValue: schedulerMock },
      ],
    }).compile();

    service = module.get(AvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('derives confidence levels correctly', () => {
    expect(service.deriveConfidence(0)).toBe('Insufficient Data');
    expect(service.deriveConfidence(40)).toBe('Medium');
    expect(service.deriveConfidence(62)).toBe('High');
  });

  it('processes a 1-hour window and upserts once per bank', async () => {
    (txMock.getStatusCounts as jest.Mock).mockResolvedValue({
      '00': 10,
      '01': 2,
      '91': 1,
      '97': 1,
    });

    await service['processWindow']('1h');
    expect(txMock.getStatusCounts).toHaveBeenCalledTimes(1);
    expect(dbMock.bankAvailability.upsert).toHaveBeenCalledTimes(1);
  });
});
