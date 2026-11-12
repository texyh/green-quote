import { ApiProperty } from '@nestjs/swagger';

export class ScheduleRowDto {
  @ApiProperty({ example: 1 })
  month: number;

  @ApiProperty({ example: 98.77 })
  payment: number;

  @ApiProperty({ example: 28.75 })
  interest: number;

  @ApiProperty({ example: 70.02 })
  principal: number;

  @ApiProperty({ example: 4929.98 })
  balance: number;
}
