import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class WarehouseInput {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly address: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    readonly providerId: number;
}