import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class AddProduct{
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @ApiProperty()
    readonly stock: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    readonly productId: number;
}