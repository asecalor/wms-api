import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPickingRepository } from '../repository/picking.repository.interface';
import { IPickingService } from './picking.service.interface';

@Injectable()
export class PickingService implements IPickingService {
  constructor(
    @Inject(IPickingRepository)
    private readonly pickingRepository: IPickingRepository,
  ) {}

  async pickProduct(orderId: number, productWareHouseId: number) {
    const updated = await this.pickingRepository.pickProduct(
      orderId,
      productWareHouseId,
    );
    if (!updated) {
      throw new NotFoundException(`Product with id 
                                  ${productWareHouseId} not found in order 
                                  ${orderId}`);
    }
  }
}
