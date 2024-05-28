import { ApiProperty } from "@nestjs/swagger";

export class ProductPicked{
  @ApiProperty()
  readonly productWareHouseId: number;

  constructor(productWareHouseId: number) {
    this.productWareHouseId = productWareHouseId;
  }
}