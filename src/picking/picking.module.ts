import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PickingRepository } from "./repository/picking.repository";

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [PickingRepository],
})
export class PickingModule {}
