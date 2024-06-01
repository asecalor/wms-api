import { ProductWarehouseDTO } from '../dto/product-warehouse.dto';
import { WarehouseDTO } from '../dto/warehouse.dto';
import { WarehouseInput } from '../input/warehouse.input';
import { NotDeliveredOrderDTO } from '../dto/not-delivered-order.dto';

export abstract class IWarehouseRepository {
  abstract create(warehouse: WarehouseInput): Promise<WarehouseDTO>;
  abstract findAll(): Promise<WarehouseDTO[]>;
  abstract findByProviderId(providerId: number): Promise<WarehouseDTO[]>;
  abstract findById(id: number): Promise<WarehouseDTO>;
  abstract moveProduct(
    productId: number,
    fromWarehouseId: number,
    toWarehouseId: number,
    quantity: number,
  ): Promise<void>;
  abstract getProductWarehouseByProviderId(
    providerId: number,
  ): Promise<ProductWarehouseDTO[]>;
  abstract existsOrderRejected(orderId: number): Promise<boolean>;
  abstract createOrderRejection(orderId: number): Promise<any>;
  abstract updateStock(
    warehouseId: number,
    productId: number,
    stock: number,
  ): Promise<void>;
  abstract getUndeliverableOrders(): Promise<NotDeliveredOrderDTO[]>;
}
