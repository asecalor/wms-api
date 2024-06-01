import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ProductOrderDTO } from '../dto/product-order.dto';

export class Order {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  readonly id: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  readonly providerId: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly address: string;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  readonly totalAmount: number;
  @IsNotEmpty()
  @ApiProperty()
  readonly products: ProductOrderDTO[];
}
