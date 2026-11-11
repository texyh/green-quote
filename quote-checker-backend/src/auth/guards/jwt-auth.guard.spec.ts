import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AllowAnonymous } from '../decorators/allow-anonymous.decorator';
import { AuthUser, JwtAuthGuard } from './jwt-auth.guard';

class TestController {
  @AllowAnonymous()
  publicRoute(this: void) {}

  privateRoute(this: void) {}
}

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  const guard = new JwtAuthGuard(jwtService, new Reflector());

  const contextWith = (
    cookies: Record<string, string>,
    handler: () => void = TestController.prototype.privateRoute,
  ) => {
    const request: { cookies: Record<string, string>; user?: AuthUser } = {
      cookies,
    };
    const context = {
      getHandler: () => handler,
      getClass: () => TestController,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { request, context };
  };

  it('lets anonymous requests through on @AllowAnonymous routes', async () => {
    const { context } = contextWith({}, TestController.prototype.publicRoute);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('attaches the user for a valid token', async () => {
    const token = await jwtService.signAsync({ sub: 'user-1', role: 'user' });
    const { request, context } = contextWith({ access_token: token });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', role: 'user' });
  });

  it('rejects a request without the cookie', async () => {
    const { context } = contextWith({});
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token signed with another secret', async () => {
    const forged = await new JwtService({ secret: 'other' }).signAsync({
      sub: 'user-1',
      role: 'admin',
    });
    const { context } = contextWith({ access_token: forged });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
