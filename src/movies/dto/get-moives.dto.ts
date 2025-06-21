import { IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { PagePaginationDto } from "src/commons/entites/dto/page-pagination.dto";

export class GetMoviesDto extends PagePaginationDto {
    @IsString()
    @IsOptional()
    title?: string
}