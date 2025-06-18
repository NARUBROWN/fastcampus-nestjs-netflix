import { IsNotEmpty, IsString } from "class-validator";
import { Movie } from "src/movies/entites/movie.entity";

export class CreateGenreDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}
