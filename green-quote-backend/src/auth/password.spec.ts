import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('verifies the original password against its hash', async () => {
    const stored = await hashPassword('correct-horse-battery');
    await expect(verifyPassword('correct-horse-battery', stored)).resolves.toBe(
      true,
    );
  });

  it('rejects a wrong password', async () => {
    const stored = await hashPassword('correct-horse-battery');
    await expect(verifyPassword('wrong-password', stored)).resolves.toBe(false);
  });

  it('salts each hash so the same password hashes differently', async () => {
    const first = await hashPassword('correct-horse-battery');
    const second = await hashPassword('correct-horse-battery');
    expect(first).not.toEqual(second);
  });
});
