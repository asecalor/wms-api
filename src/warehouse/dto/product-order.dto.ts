import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ProductOrderDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  quantity: number;

  constructor(productId: number, quantity: number) {
    this.productId = productId;
    this.quantity = quantity;
  }
}
