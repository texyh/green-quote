import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from './jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

class TestController {
  @Roles('admin')
  adminRoute(this: void) {}

  anyRoute(this: void) {}
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  const contextFor = (user: AuthUser | undefined, handler: () => void) =>
    ({
      getHandler: () => handler,
      getClass: () => TestController,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  it('allows routes without @Roles for any user', () => {
    const context = contextFor(
      { id: 'u1', role: 'user' },
      TestController.prototype.anyRoute,
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows an admin on an admin route', () => {
    const context = contextFor(
      { id: 'a1', role: 'admin' },
      TestController.prototype.adminRoute,
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('forbids a regular user on an admin route', () => {
    const context = contextFor(
      { id: 'u1', role: 'user' },
      TestController.prototype.adminRoute,
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
