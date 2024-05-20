export class ProductToPickDto {
  readonly productWareHouseId: number;
  readonly quantity: number;

  constructor(productId: number, quantity: number) {
    this.productWareHouseId = productId;
    this.quantity = quantity;
  }
}
