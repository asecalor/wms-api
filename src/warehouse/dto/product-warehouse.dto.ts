export class ProductWarehouseDto {
  readonly productWarehouseId: number;
  readonly warehouseId: number;
  readonly productId: number;
  readonly stock: number;

  constructor(
    productWarehouseId: number,
    warehouseId: number,
    productId: number,
    stock: number,
  ) {
    this.productWarehouseId = productWarehouseId;
    this.warehouseId = warehouseId;
    this.productId = productId;
    this.stock = stock;
  }
}
