import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../model';

export class OrderUpdate {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: OrderStatus;
}
