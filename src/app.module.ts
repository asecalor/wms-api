import { Module } from '@nestjs/common';
import { WarehouseModule } from './warehouse/warehouse.module';
import { PickingModule } from './picking/picking.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from "@nestjs/config";
import { StockGateway } from './socket/socket.gateway';

@Module({
  imports: [WarehouseModule, PickingModule, HttpModule,ConfigModule],
  controllers: [],
  providers: [StockGateway],
})
export class AppModule {}
