import { IsArray, IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class CursorPainationDto {
    @IsString()
    @IsOptional()
    cursor?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    order: string[] = ['id_DESC'];

    @IsInt()
    @IsOptional()
    take: number = 5;
}