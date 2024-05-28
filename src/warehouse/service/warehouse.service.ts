import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ProductToPickDto } from "../dto/product-to-pick.dto";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Order } from "../input/order.input";
import { IWarehouseService } from "./warehouse.service.interface";
import { IWarehouseRepository } from "../repository/warehouse.repository.interface";
import { WarehouseDTO } from "../dto/warehouse.dto";
import { WarehouseInput } from "../input/warehouse.input";
import { MoveProductInput } from "../input/move-product.input";
import { IPickingRepository } from "src/picking/repository/picking.repository.interface";
import { OrderUpdateDTO } from "../dto/order-update.dto";
import { OrderStatus } from "../model";
import { ProductWarehouseDTO } from "../dto/product-warehouse.dto";


@Injectable()
export class WarehouseService implements IWarehouseService {
  constructor(
    @Inject(IWarehouseRepository) private readonly warehouseRepository: IWarehouseRepository,
    @Inject(IPickingRepository) private readonly pickingRepository: IPickingRepository,
    private readonly httpService: HttpService,
  ) { }

  async createWarehouse(warehouse: WarehouseInput): Promise<WarehouseDTO> {
    return await this.warehouseRepository.create(warehouse);
  }

  async getAllWarehouses(providerId?: number): Promise<WarehouseDTO[]> {
    if (providerId) {
      return await this.warehouseRepository.findByProviderId(providerId);
    }
    return await this.warehouseRepository.findAll();
  }

  async getWarehouseById(id: number): Promise<WarehouseDTO> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse not found`);
    }
    return warehouse;
  }

  async moveProduct(productId: number, move: MoveProductInput): Promise<void> {
    const { providerId, fromWarehouseId, toWarehouseId, quantity } = move;
    const fromWarehouse = await this.warehouseRepository.findById(fromWarehouseId);
    const toWarehouse = await this.warehouseRepository.findById(toWarehouseId);

    if (!fromWarehouse || !toWarehouse) {
      throw new NotFoundException(`Warehouse not found`);
    }
    if (fromWarehouse.providerId !== providerId || toWarehouse.providerId !== providerId) {
      throw new UnauthorizedException(`Warehouses must belong to the same provider`);
    }
    if (fromWarehouse.providerId !== toWarehouse.providerId) {
      throw new UnauthorizedException(`Warehouses must belong to the same provider`);
    }
    const products = fromWarehouse.products.find(p => p.productId === productId);
    if (!products) {
      throw new NotFoundException(`Product not found in warehouse`);
    }
    if (products.stock < quantity) {
      throw new ConflictException(`Insufficient stock in warehouse`);
    }

    await this.warehouseRepository.moveProduct(productId, fromWarehouseId, toWarehouseId, quantity);
    return;
  }
  async handleOrder(order: Order) {
    await this.checkOrderExists(order);
    const productWarehouses = await this.getProductWarehouses(order);
    const productsToPick = await this.checkAndPrepareProducts(
      order,
      productWarehouses,
    );
    const orderExecution = await this.createOrderExecution(order);
    await this.pickingRepository.create(
      orderExecution.id,
      productsToPick,
    );
    await this.updateOrderStatus(order.id, OrderStatus.ACCEPTED);
  }

  private async checkOrderExists(order: Order) {
    const orderAlreadyExists =
      (await this.warehouseRepository.existsOrderExecuted(order.id)) ||
      (await this.warehouseRepository.existsOrderRejected(order.id));
    if (orderAlreadyExists) {
      throw new ConflictException('Order was already managed');
    }
  }

  private async getProductWarehouses(order: Order) {
    const providerId = order.providerId;
    return await this.warehouseRepository.getProductWarehouseByProviderId(
      providerId,
    );
  }

  private async checkAndPrepareProducts(
    order: Order,
    productWarehouses: ProductWarehouseDTO[],
  ) {
    const productsToPick: ProductToPickDto[] = [];
    for (const productOrder of order.products) {
      const wareHousesWithProduct = productWarehouses.filter(
        (p) => p.productId == productOrder.productId,
      );
      const wareHouseWithStockOfProduct = wareHousesWithProduct.find(
        (p) => p.stock >= productOrder.quantity,
      );
      if (!wareHouseWithStockOfProduct) {
        await this.warehouseRepository.createOrderRejection(order.id);
        throw new ConflictException(
          'Insufficient stock for product: ' + productOrder.productId,
        );
      }
      productsToPick.push(
        new ProductToPickDto(
          wareHouseWithStockOfProduct.productId,
          productOrder.quantity,
        ),
      );
      await this.warehouseRepository.updateStock(
        wareHouseWithStockOfProduct.productId,
        productOrder.quantity,
      );
    }
    return productsToPick;
  }

  private async createOrderExecution(order: Order) {
    return await this.warehouseRepository.createOrderExecution(order.id);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    await firstValueFrom(
      this.httpService.put(
        `http://control-tower-api:3000/order/${orderId}`,
        {
          status,
        },
      ),
    );
  }

  async getUndeliverableOrders(){
    return this.warehouseRepository.getUndeliverableOrders();
  }
}
