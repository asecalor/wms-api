export class ProductStockDto {
  readonly productId: number;
  readonly stock: number;

  constructor(productId: number, stock: number) {
    this.productId = productId;
    this.stock = stock;
  }
}
