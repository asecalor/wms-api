import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MoveProductInput {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  providerId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  fromWarehouseId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  toWarehouseId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  quantity: number;
}
