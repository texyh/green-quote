import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DiskHealthIndicator, TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const dbStatus = jest.fn();
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    })
      .overrideProvider(TypeOrmHealthIndicator)
      .useValue({
        pingCheck: (key: string) => ({
          withTimeout: () => Promise.resolve({ [key]: { status: dbStatus() } }),
        }),
      })
      .overrideProvider(DiskHealthIndicator)
      .useValue({ checkStorage: (key: string) => Promise.resolve({ [key]: { status: 'up' } }) })
      .compile();
    controller = module.get(HealthController);
  });

  it('reports ok with database and memory when both are healthy', async () => {
    dbStatus.mockReturnValue('up');
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(Object.keys(result.info ?? {})).toEqual(['database', 'memory_heap']);
  });

  it('returns 503 when the database is down', async () => {
    dbStatus.mockReturnValue('down');
    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
