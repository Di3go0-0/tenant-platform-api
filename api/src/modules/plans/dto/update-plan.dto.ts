import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'pro' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Pro plan for growing teams' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 50, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @ApiPropertyOptional({ example: 500, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxRequestsPerMinute?: number;

  @ApiPropertyOptional({ example: 29.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
