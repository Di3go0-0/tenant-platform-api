import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxRequestsPerMinute?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
