import { ProductToPickDto } from "src/warehouse/dto/product-to-pick.dto";

export abstract class IPickingRepository {
    abstract create(orderExecutionId: number,
        productsToPickDto: ProductToPickDto[],
    ): Promise<void>;
    abstract pickProduct(orderExecutionId: number, productWareHouseId: number): Promise<boolean>;
}