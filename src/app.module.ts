import { Module } from '@nestjs/common';
import { WarehouseModule } from "./warehouse/warehouse.module";
import { PickingModule } from "./picking/picking.module";

@Module({
  imports: [WarehouseModule,PickingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
