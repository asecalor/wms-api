import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PickingRepository } from "../repository/picking.repository";

@Injectable()
export class PickingService{
  constructor(@Inject(PickingRepository) private readonly pickingRepository: PickingRepository){}

  async updatePickProduct(orderExecutionId: number, productWareHouseId: number){
    const updated = await this.pickingRepository.updateToPickedProduct(orderExecutionId, productWareHouseId);
    if (!updated){
      throw new NotFoundException(`Product with id 
                                  ${productWareHouseId} not found in order execution
                                  ${orderExecutionId}`)
    }
  }

}