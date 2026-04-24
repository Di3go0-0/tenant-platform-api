import { IsString, IsUUID } from 'class-validator';

export class RolePermissionDto {
  @IsString()
  @IsUUID()
  roleId: string;

  @IsString()
  @IsUUID()
  permissionId: string;
}
