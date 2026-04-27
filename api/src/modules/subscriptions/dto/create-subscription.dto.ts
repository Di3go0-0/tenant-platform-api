import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;
}
