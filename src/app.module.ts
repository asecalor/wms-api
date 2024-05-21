import { Module } from '@nestjs/common';
import { WarehouseModule } from './warehouse/warehouse.module';
import { PickingModule } from './picking/picking.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [WarehouseModule, PickingModule, HttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
