import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { hashPassword, verifyPassword } from './password';

export type AuthResult = { user: UserResponseDto; accessToken: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase();
    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.usersService.create({
      fullName: dto.fullName,
      email,
      passwordHash: await hashPassword(dto.password),
    });
    return this.issueToken(user);
  }

  async signIn(dto: SignInDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return UserResponseDto.fromEntity(user);
  }

  private async issueToken(user: User): Promise<AuthResult> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });
    return { user: UserResponseDto.fromEntity(user), accessToken };
  }
}
