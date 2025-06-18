import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Genre as number } from "src/genres/entities/genre.entity";

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    detail: string;

    @IsNotEmpty()
    @IsNumber()
    directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({},
        {
            each: true
        }
    )
    genreIds: number[];
}