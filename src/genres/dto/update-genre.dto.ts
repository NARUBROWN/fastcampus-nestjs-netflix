import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Movie } from 'src/movies/entites/movie.entity';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {
}
