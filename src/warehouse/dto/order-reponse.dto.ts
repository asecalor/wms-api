import { ProductOrderDto } from './product-order.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderResponseDto {
  @IsNotEmpty()
  @IsNumber()
  readonly orderId: number;
  @IsNotEmpty()
  @IsNumber()
  readonly providerId: number;
  @IsNotEmpty()
  @IsString()
  readonly clientAddress: string;
  @IsNotEmpty()
  @IsNumber()
  readonly totalAmount: number;
  @IsNotEmpty()
  readonly productOrders: ProductOrderDto[];
}
