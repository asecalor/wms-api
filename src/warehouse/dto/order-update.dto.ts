import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrderUpdateDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  status: string;

  constructor(status: string) {
    this.status = status;
  }
}
