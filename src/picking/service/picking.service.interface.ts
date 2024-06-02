export abstract class IPickingService {
  abstract pickProduct(
    orderId: number,
    productWareHouseId: number,
  ): Promise<void>;
}
