import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { WarehouseRepository } from '../repository/warehouse.repository';
import { OrderResponseDto } from '../dto/order-reponse.dto';
import { PickingRepository } from "../../picking/repository/picking.repository";
import { ProductToPickDto } from "../dto/product-to-pick.dto";
import { ProductWarehouseDto } from "../dto/product-warehouse.dto";

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WarehouseRepository)
    private readonly warehouseRepository: WarehouseRepository,
    @Inject(PickingRepository)
    private readonly pickingRepository: PickingRepository,
  ) {}

  async handleOrder(order: OrderResponseDto) {
    await this.checkOrderExists(order);
    const productWarehouses = await this.getProductWarehouses(order);
    const productsToPick = await this.checkAndPrepareProducts(order, productWarehouses);
    const orderExecution = await this.createOrderExecution(order);
    await this.pickingRepository.createPicking(orderExecution.id, productsToPick);
  }

  private async checkOrderExists(order: OrderResponseDto) {
    const orderAlreadyExists = await this.warehouseRepository.existsOrderExecuted(order.orderId) ||
      await this.warehouseRepository.existsOrderRejected(order.orderId);
    if (orderAlreadyExists) {
      throw new ConflictException('Order was already managed');
    }
  }

  private async getProductWarehouses(order: OrderResponseDto) {
    const providerId = order.providerId;
    return await this.warehouseRepository.getProductWarehouseByProviderId(providerId);
  }

  private async checkAndPrepareProducts(order: OrderResponseDto, productWarehouses: ProductWarehouseDto[]) {
    const productsToPick: ProductToPickDto[] = [];
    for (const productOrder of order.productOrders) {
      const productWarehouse = productWarehouses.find(
        (productWarehouse) => productWarehouse.productId === productOrder.productId
      );
      if (!productWarehouse) {
        await this.warehouseRepository.createOrderRejection(order.orderId);
        throw new ConflictException('Product not found in warehouse');
      }
      if (productWarehouse.stock < productOrder.quantity) {
        await this.warehouseRepository.createOrderRejection(order.orderId);
        throw new ConflictException('Insufficient stock');
      }
      productsToPick.push(new ProductToPickDto(productWarehouse.productWarehouseId, productOrder.quantity));
      await this.warehouseRepository.updateStock(productWarehouse.productWarehouseId, productOrder.quantity);
    }
    return productsToPick;
  }

  private async createOrderExecution(order: OrderResponseDto) {
    return await this.warehouseRepository.createOrderExecution(order.orderId);
  }

}
