import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'starter' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Starter plan for small teams' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsNumber()
  @Min(1)
  maxUsers: number;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsNumber()
  @Min(1)
  maxRequestsPerMinute: number;

  @ApiProperty({ example: 9.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}
