import { IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/commons/entites/dto/pagination.dto";

export class GetMoviesDto extends PaginationDto {
    @IsString()
    @IsOptional()
    title?: string
}