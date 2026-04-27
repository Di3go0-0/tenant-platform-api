import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
