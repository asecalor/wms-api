import { ApiProperty } from '@nestjs/swagger';

export class ProductToPickDto {
  @ApiProperty()
  readonly productWareHouseId: number;

  @ApiProperty()
  readonly quantity: number;

  constructor(productId: number, quantity: number) {
    this.productWareHouseId = productId;
    this.quantity = quantity;
  }
}
