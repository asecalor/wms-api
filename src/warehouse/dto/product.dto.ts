import { ApiProperty } from '@nestjs/swagger';

export class ProductDTO {
  @ApiProperty()
  readonly productWareHouseId: number;
  @ApiProperty()
  readonly quantity: number;
  @ApiProperty()
  readonly picked: boolean;

  constructor(productDTO: ProductDTO) {
    this.productWareHouseId = productDTO.productWareHouseId;
    this.quantity = productDTO.quantity;
    this.picked = productDTO.picked;
  }
}
