import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ListQuotesQueryDto } from './list-quotes-query.dto';

describe('ListQuotesQueryDto validation', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const validate = (query: Record<string, string>) =>
    pipe.transform(query, { type: 'query', metatype: ListQuotesQueryDto });

  it('defaults to page 1 and limit 10', async () => {
    await expect(validate({})).resolves.toEqual({ page: 1, limit: 10 });
  });

  it('converts query strings to numbers', async () => {
    await expect(validate({ page: '3', limit: '25' })).resolves.toEqual({
      page: 3,
      limit: 25,
    });
  });

  it.each([
    ['page 0', { page: '0' }],
    ['limit above 100', { limit: '101' }],
    ['non-numeric page', { page: 'abc' }],
    ['decimal limit', { limit: '2.5' }],
  ])('rejects %s', async (_, query) => {
    await expect(validate(query)).rejects.toBeInstanceOf(BadRequestException);
  });
});
