import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductToPickDto } from '../dto/product-to-pick.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Order } from '../input/order.input';
import { IWarehouseService } from './warehouse.service.interface';
import { IWarehouseRepository } from '../repository/warehouse.repository.interface';
import { WarehouseDTO } from '../dto/warehouse.dto';
import { WarehouseInput } from '../input/warehouse.input';
import { MoveProductInput } from '../input/move-product.input';
import { IPickingRepository } from 'src/picking/repository/picking.repository.interface';
import { OrderStatus } from '../model';
import { ProductWarehouseDTO } from '../dto/product-warehouse.dto';
import { NotDeliveredOrderDTO } from '../dto/not-delivered-order.dto';
import { ConfigService } from "@nestjs/config";
import { StockGateway } from 'src/socket/socket.gateway';

@Injectable()
export class WarehouseService implements IWarehouseService {
  private readonly controlTowerUrl: string;
  constructor(
    @Inject(IWarehouseRepository)
    private readonly warehouseRepository: IWarehouseRepository,
    @Inject(IPickingRepository)
    private readonly pickingRepository: IPickingRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly stockGateway: StockGateway,
  ) {
    this.controlTowerUrl = this.configService.get<string>('CONTROL_TOWER_URL');
  }

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
    const fromWarehouse =
      await this.warehouseRepository.findById(fromWarehouseId);
    const toWarehouse = await this.warehouseRepository.findById(toWarehouseId);

    if (!fromWarehouse || !toWarehouse) {
      throw new NotFoundException(`Warehouse not found`);
    }
    if (
      fromWarehouse.providerId !== providerId ||
      toWarehouse.providerId !== providerId
    ) {
      throw new UnauthorizedException(
        `Warehouses must belong to the same provider`,
      );
    }
    if (fromWarehouse.providerId !== toWarehouse.providerId) {
      throw new UnauthorizedException(
        `Warehouses must belong to the same provider`,
      );
    }
    const products = fromWarehouse.products.find(
      (p) => p.productId === productId,
    );
    if (!products) {
      throw new NotFoundException(`Product not found in warehouse`);
    }
    if (products.stock < quantity) {
      throw new ConflictException(`Insufficient stock in warehouse`);
    }

    await this.warehouseRepository.moveProduct(
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
    );
    return;
  }

  async handleOrder(order: Order) {
    await this.checkOrderExists(order);
    const productWarehouses = await this.getProductWarehouses(order);
    const productsToPick = await this.checkAndPrepareProducts(
      order,
      productWarehouses,
    );
    await this.pickingRepository.create(order.id, productsToPick);
    await firstValueFrom(
      this.httpService.put(`${this.controlTowerUrl}/order/${order.id}`, {
        status: OrderStatus.ACCEPTED,
      }),
    );
  }

  async addProductToWarehouse(warehouseId: number, productId: number, stock: number): Promise<void> {
    await this.warehouseRepository.addProduct(productId, warehouseId, stock);
  }

  private async checkOrderExists(order: Order) {
    const orderAlreadyExists =
      (await this.pickingRepository.existsOrder(order.id)) ||
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
      const newStock = wareHouseWithStockOfProduct.stock - productOrder.quantity;
      const updatedProduct = await this.warehouseRepository.updateStock(
        wareHouseWithStockOfProduct.wareHouseId,
        wareHouseWithStockOfProduct.productId,
        newStock,
      );

      if(updatedProduct.stock < 10) {
        this.stockGateway.emitStockAlert(updatedProduct);
      }
      
    }
    return productsToPick;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    const notDeliveredOrderDTOS = await this.getUndeliverableOrders();
    const isUndeliverableOrder = notDeliveredOrderDTOS.find(
      (order) => order.orderId === orderId,
    );
    if (isUndeliverableOrder) {
      const productIds = isUndeliverableOrder.products
        .map((product) => `productWareHouseId: ${product.productWareHouseId}`)
        .join(', ');
      throw new ConflictException(
        `Order cannot be delivered, the following products are not picked: ${productIds}`,
      );
    }
    await firstValueFrom(
      this.httpService.put(`${this.controlTowerUrl}/order/${orderId}`, {
        status,
      }),
    );
  }

  async getUndeliverableOrders(): Promise<NotDeliveredOrderDTO[]> {
    return this.warehouseRepository.getUndeliverableOrders();
  }
}
