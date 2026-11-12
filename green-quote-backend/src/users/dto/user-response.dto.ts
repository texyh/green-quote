import { ApiProperty } from '@nestjs/swagger';
import type { User, UserRole } from '../user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ enum: ['user', 'admin'] })
  role: UserRole;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }
}
