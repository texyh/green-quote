import {
  BadRequestException,
  Controller,
  Get,
  INestApplication,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AllExceptionsFilter } from './all-exceptions.filter';

@Controller('test')
class TestController {
  @Get('missing')
  missing() {
    throw new NotFoundException('Quote not found');
  }

  @Get('invalid')
  invalid() {
    throw new BadRequestException([
      'systemSizeKw must be a number',
      'address should not be empty',
    ]);
  }

  @Get('crash')
  crash() {
    throw new Error('database exploded');
  }
}

describe('AllExceptionsFilter', () => {
  let app: INestApplication;
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TestController],
      providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
    }).compile();
    app = module.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('logs client errors as warnings and keeps the normal response body', async () => {
    const res = await request(app.getHttpServer())
      .get('/test/missing?search=jane@example.com')
      .expect(404);

    expect(res.body).toEqual({
      statusCode: 404,
      message: 'Quote not found',
      error: 'Not Found',
    });
    expect(warn).toHaveBeenCalledWith({
      message: 'Request failed',
      method: 'GET',
      path: '/test/missing',
      statusCode: 404,
      error: 'Quote not found',
    });
  });

  it('logs the validation messages for a 400', async () => {
    await request(app.getHttpServer()).get('/test/invalid').expect(400);

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'systemSizeKw must be a number; address should not be empty',
      }),
    );
  });

  it('logs unexpected errors with a stack and hides details from the client', async () => {
    const res = await request(app.getHttpServer())
      .get('/test/crash')
      .expect(500);

    expect(res.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'database exploded',
        stack: expect.stringContaining('database exploded'),
      }),
    );
  });
});
