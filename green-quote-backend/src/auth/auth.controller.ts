import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Response } from 'express';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { AuthResult, AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import type { AuthUser } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  private readonly sessionCookieOptions: CookieOptions;
  private readonly sessionTtlSeconds: number;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    this.sessionCookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.get<string>('NODE_ENV') === 'production',
    };
    this.sessionTtlSeconds = Number(
      config.getOrThrow<string>('SESSION_TTL_SECONDS'),
    );
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
