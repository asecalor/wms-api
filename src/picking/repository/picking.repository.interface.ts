import { ProductToPickDto } from 'src/warehouse/dto/product-to-pick.dto';

export abstract class IPickingRepository {
  abstract create(
    orderId: number,
    productsToPickDto: ProductToPickDto[],
  ): Promise<void>;

  abstract existsOrder(orderId: number): Promise<boolean>;
  abstract pickProduct(
    orderId: number,
    productWareHouseId: number,
  ): Promise<boolean>;
}
