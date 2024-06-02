import { ApiProperty } from '@nestjs/swagger';
import { ProductWarehouseDTO } from './product-warehouse.dto';

export class WarehouseDTO {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly providerId: number;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly products: ProductWarehouseDTO[];

  constructor(warehouse: WarehouseDTO) {
    this.id = warehouse.id;
    this.providerId = warehouse.providerId;
    this.address = warehouse.address;
    this.products = warehouse.products.map(
      (product) => new ProductWarehouseDTO(product),
    );
  }
}
