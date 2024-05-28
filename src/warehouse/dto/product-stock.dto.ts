import { ApiProperty } from "@nestjs/swagger";

export class ProductStockDto {

  @ApiProperty()
  readonly productId: number;

  @ApiProperty()
  readonly stock: number;

  constructor(productId: number, stock: number) {
    this.productId = productId;
    this.stock = stock;
  }
}
