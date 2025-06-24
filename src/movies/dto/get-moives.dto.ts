import { IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { PagePaginationDto } from "src/commons/entites/dto/page-pagination.dto";
import { CursorPainationDto } from "../../commons/entites/dto/cusor-pagination.dto";

export class GetMoviesDto extends CursorPainationDto {
    @IsString()
    @IsOptional()
    title?: string
}