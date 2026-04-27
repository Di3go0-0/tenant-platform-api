import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsUUID()
  roleId: string;
}
