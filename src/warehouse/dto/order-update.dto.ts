import { IsNotEmpty, IsString } from 'class-validator';

export class OrderUpdateDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  constructor(status: string) {
    this.status = status;
  }
}
