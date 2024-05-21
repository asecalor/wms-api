import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { WarehouseRepository } from '../repository/warehouse.repository';
import { OrderResponseDto } from '../dto/order-reponse.dto';
import { PickingRepository } from '../../picking/repository/picking.repository';
import { ProductToPickDto } from '../dto/product-to-pick.dto';
import { ProductWarehouseDto } from '../dto/product-warehouse.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrderUpdateDto } from '../dto/order-update.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WarehouseRepository)
    private readonly warehouseRepository: WarehouseRepository,
    @Inject(PickingRepository)
    private readonly pickingRepository: PickingRepository,
    private readonly httpService: HttpService,
  ) {}

  async handleOrder(order: OrderResponseDto) {
    await this.checkOrderExists(order);
    const productWarehouses = await this.getProductWarehouses(order);
    const productsToPick = await this.checkAndPrepareProducts(
      order,
      productWarehouses,
    );
    const orderExecution = await this.createOrderExecution(order);
    await this.pickingRepository.createPicking(
      orderExecution.id,
      productsToPick,
    );
    await this.updateOrderStatus(order.orderId, new OrderUpdateDto('ACCEPTED'));
  }

  private async checkOrderExists(order: OrderResponseDto) {
    const orderAlreadyExists =
      (await this.warehouseRepository.existsOrderExecuted(order.orderId)) ||
      (await this.warehouseRepository.existsOrderRejected(order.orderId));
    if (orderAlreadyExists) {
      throw new ConflictException('Order was already managed');
    }
  }

  private async getProductWarehouses(order: OrderResponseDto) {
    const providerId = order.providerId;
    return await this.warehouseRepository.getProductWarehouseByProviderId(
      providerId,
    );
  }

  private async checkAndPrepareProducts(
    order: OrderResponseDto,
    productWarehouses: ProductWarehouseDto[],
  ) {
    const productsToPick: ProductToPickDto[] = [];
    for (const productOrder of order.productOrders) {
      const wareHousesWithProduct = productWarehouses.filter(
        (p) => p.productId == productOrder.productId,
      );
      const wareHouseWithStockOfProduct = wareHousesWithProduct.find(
        (p) => p.stock >= productOrder.quantity,
      );
      if (!wareHouseWithStockOfProduct) {
        await this.warehouseRepository.createOrderRejection(order.orderId);
        throw new ConflictException(
          'Insufficient stock for product: ' + productOrder.productId,
        );
      }
      productsToPick.push(
        new ProductToPickDto(
          wareHouseWithStockOfProduct.productWarehouseId,
          productOrder.quantity,
        ),
      );
      await this.warehouseRepository.updateStock(
        wareHouseWithStockOfProduct.productWarehouseId,
        productOrder.quantity,
      );
    }
    return productsToPick;
  }

  private async createOrderExecution(order: OrderResponseDto) {
    return await this.warehouseRepository.createOrderExecution(order.orderId);
  }

  async updateOrderStatus(orderId: number, orderUpdate: OrderUpdateDto) {
    await firstValueFrom(
      this.httpService.put(
        `http://localhost:3000/order/${orderId}`,
        orderUpdate,
      ),
    );
  }
}
