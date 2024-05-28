export abstract class IPickingService {
    abstract pickProduct(orderExecutionId: number, productWareHouseId: number): Promise<void>;
}