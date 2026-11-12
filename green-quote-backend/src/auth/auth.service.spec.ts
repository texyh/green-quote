import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { hashPassword } from './password';

describe('AuthService', () => {
  const usersService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };
  const service = new AuthService(
    usersService as unknown as UsersService,
    jwtService as unknown as JwtService,
  );

  const existingUser = async (): Promise<User> =>
    Object.assign(new User(), {
      id: 'user-1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: await hashPassword('correct-horse-battery'),
      role: 'user',
    });

  beforeEach(() => jest.clearAllMocks());

  describe('signUp', () => {
    it('creates the user with a hashed password and returns a token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((user: Partial<User>) =>
        Promise.resolve({ ...user, id: 'user-1', role: 'user' }),
      );

      const result = await service.signUp({
        fullName: 'Jane Doe',
        email: 'Jane@Example.com',
        password: 'correct-horse-battery',
      });

      const created = usersService.create.mock.calls[0][0] as User;
      expect(created.email).toBe('jane@example.com');
      expect(created.passwordHash).not.toContain('correct-horse-battery');
      expect(result).toEqual({
        accessToken: 'signed-token',
        user: {
          id: 'user-1',
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          role: 'user',
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        role: 'user',
      });
    });

    it('rejects an email that is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(await existingUser());
      await expect(
        service.signUp({
          fullName: 'Jane',
          email: 'jane@example.com',
          password: 'whatever123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('returns the user and a token for the right password', async () => {
      usersService.findByEmail.mockResolvedValue(await existingUser());
      const result = await service.signIn({
        email: 'JANE@example.com',
        password: 'correct-horse-battery',
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('jane@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.accessToken).toBe('signed-token');
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(await existingUser());
      await expect(
        service.signIn({
          email: 'jane@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unknown email with the same error', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.signIn({
          email: 'nobody@example.com',
          password: 'whatever123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('returns the signed-in user without the password hash', async () => {
      usersService.findById.mockResolvedValue(await existingUser());
      const user = await service.me('user-1');
      expect(user).toEqual({
        id: 'user-1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user',
      });
    });

    it('rejects a token for a user that no longer exists', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(service.me('deleted-user')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
