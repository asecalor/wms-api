import { ApiProperty } from '@nestjs/swagger';
import { ProductDTO } from './product.dto';

export class NotDeliveredOrderDTO {
  @ApiProperty()
  readonly orderId: number;
  @ApiProperty({ type: ProductDTO, isArray: true })
  readonly products: ProductDTO[];

  constructor(orderId: number, picking: ProductDTO[]) {
    this.orderId = orderId;
    this.products = picking;
  }
}
