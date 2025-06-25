import { IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { PagePaginationDto } from "src/commons/dto/page-pagination.dto";
import { CursorPainationDto } from "../../commons/dto/cusor-pagination.dto";

export class GetMoviesDto extends CursorPainationDto {
    @IsString()
    @IsOptional()
    title?: string
}