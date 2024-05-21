import {
  Body,
  Controller,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { OrderResponseDto } from '../dto/order-reponse.dto';
import { WarehouseService } from '../service/warehouse.service';
import { OrderUpdateDto } from '../dto/order-update.dto';

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

  @Put('order/:orderId')
  async updateOrderStatus(
    @Param('orderId', ParseIntPipe) clientId: number,
    @Body() orderStatus: OrderUpdateDto,
  ) {
    return this.warehouseService.updateOrderStatus(clientId, orderStatus);
  }
}
