import { Inject, Injectable } from "@nestjs/common";
import { PickingRepository } from "../repository/picking.repository";

@Injectable()
export class PickingService{
  constructor(@Inject(PickingRepository) private readonly pickingRepository: PickingRepository){}

}