import { ApiProperty } from "@nestjs/swagger";

export class ProductWarehouseDTO {

  @ApiProperty()
  readonly wareHouseId: number;

  @ApiProperty()
  readonly productId: number;

  @ApiProperty()
  readonly stock: number;

  constructor(product: ProductWarehouseDTO) {
    this.wareHouseId = product.wareHouseId;
    this.productId = product.productId;
    this.stock = product.stock;
  }
}
