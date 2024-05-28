import { WarehouseDTO } from "../dto/warehouse.dto";
import { MoveProductInput } from "../input/move-product.input";
import { Order } from "../input/order.input";
import { WarehouseInput } from "../input/warehouse.input";

export abstract class IWarehouseService {
    abstract createWarehouse(warehouse: WarehouseInput): Promise<WarehouseDTO>;
    abstract getAllWarehouses(providerId?: number): Promise<WarehouseDTO[]>;
    abstract getWarehouseById(id: number): Promise<WarehouseDTO>;
    abstract moveProduct(productId: number, move: MoveProductInput): Promise<void>;
    abstract updateOrderStatus(orderId: number, status: string): Promise<void>;
    abstract handleOrder(order: Order): Promise<void>;
    abstract getUndeliverableOrders(): Promise<Order[]>;
    // abstract updateProductStock(productId: number, stock: number): Promise<void>;
    // abstract updateProductPicked(productWareHouseId: number): Promise<void>;
}