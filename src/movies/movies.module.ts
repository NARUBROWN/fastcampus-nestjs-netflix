import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entites/movie.entity';
import { MovieDetail } from './entites/movie-detail.entity';
import { Director } from 'src/directors/entites/director.entity';
import { Genre } from 'src/genres/entities/genre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie, MovieDetail, Director, Genre
    ])
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
