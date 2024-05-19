import { Body, Controller, Inject, Post } from '@nestjs/common';
import { OrderResponseDto } from '../dto/order-reponse.dto';
import { WarehouseService } from '../service/warehouse.service';

@Controller('warehouse')
export class WarehouseController {
  constructor(
    @Inject(WarehouseService)
    private readonly warehouseService: WarehouseService,
  ) {}

  @Post('order')
  async handleOrder(@Body() order: OrderResponseDto) {
    await this.warehouseService.handleOrder(order);
  }
}
