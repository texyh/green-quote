import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ACCESS_TOKEN_COOKIE, KEYCLOAK_LOGIN_COOKIE } from './auth.constants';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { AuthResult, AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import type { AuthUser } from './guards/jwt-auth.guard';
import { KeycloakLogin, KeycloakService } from './keycloak.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  private readonly sessionCookieOptions: CookieOptions;
  private readonly sessionTtlSeconds: number;

  constructor(
    private readonly authService: AuthService,
    private readonly keycloakService: KeycloakService,
    config: ConfigService,
  ) {
    this.sessionCookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.get<string>('NODE_ENV') === 'production',
    };
    this.sessionTtlSeconds = config.getOrThrow<number>('SESSION_TTL_SECONDS');
  }

  @AllowAnonymous()
  @Post('signup')
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Email is already registered' })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    this.logger.log('POST /api/auth/signup');
    const result = await this.authService.signUp(dto);
    this.logger.log({
      message: 'POST /api/auth/signup created',
      userId: result.user.id,
    });
    return this.setSessionCookie(res, result);
  }

  @AllowAnonymous()
  @Post('signin')
  @HttpCode(200)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    this.logger.log('POST /api/auth/signin');
    const result = await this.authService.signIn(dto);
    this.logger.log({
      message: 'POST /api/auth/signin succeeded',
      userId: result.user.id,
    });
    return this.setSessionCookie(res, result);
  }

  @AllowAnonymous()
  @Post('signout')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Session cookie cleared' })
  signOut(@Res({ passthrough: true }) res: Response): void {
    this.logger.log('POST /api/auth/signout');
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.sessionCookieOptions);
  }

  @AllowAnonymous()
  @Get('keycloak/login')
  @ApiExcludeEndpoint()
  keycloakLogin(@Res() res: Response): void {
    this.logger.log('GET /api/auth/keycloak/login');
    const login = this.keycloakService.createLogin();
    res.cookie(
      KEYCLOAK_LOGIN_COOKIE,
      JSON.stringify({ state: login.state, codeVerifier: login.codeVerifier }),
      { ...this.sessionCookieOptions, maxAge: 5 * 60 * 1000 },
    );
    res.redirect(login.url);
  }

  @AllowAnonymous()
  @Get('keycloak/callback')
  @ApiExcludeEndpoint()
  async keycloakCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('GET /api/auth/keycloak/callback');
    const saved = req.cookies[KEYCLOAK_LOGIN_COOKIE] as string | undefined;
    res.clearCookie(KEYCLOAK_LOGIN_COOKIE, this.sessionCookieOptions);

    const login = saved
      ? (JSON.parse(saved) as Pick<KeycloakLogin, 'state' | 'codeVerifier'>)
      : undefined;
    if (!code || !login || login.state !== state) {
      this.logger.warn('Keycloak callback with a missing code or bad state');
      res.redirect('/signin?error=keycloak');
      return;
    }

    try {
      const profile = await this.keycloakService.exchangeCode(
        code,
        login.codeVerifier,
      );
      const result = await this.authService.signInWithKeycloak(profile);
      this.logger.log({
        message: 'GET /api/auth/keycloak/callback succeeded',
        userId: result.user.id,
      });
      this.setSessionCookie(res, result);
      res.redirect(result.user.role === 'admin' ? '/admin/quotes' : '/quotes');
    } catch (error) {
      this.logger.warn({
        message: 'Keycloak sign-in failed',
        reason: error instanceof Error ? error.message : String(error),
      });
      res.redirect('/signin?error=keycloak');
    }
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not signed in' })
  me(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    this.logger.log({ message: 'GET /api/auth/me', userId: user.id });
    return this.authService.me(user.id);
  }

  private setSessionCookie(res: Response, result: AuthResult): UserResponseDto {
    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      ...this.sessionCookieOptions,
      maxAge: this.sessionTtlSeconds * 1000,
    });
    return result.user;
  }
}
