import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
@UseInterceptors(ClassSerializerInterceptor)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getMovies(
    @Query('title') title ?: string
  ) {
    return this.moviesService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
      return this.moviesService.getMoiveById(+id);
  }

  @Post()
  postMovie(
    @Body() body: CreateMovieDto
  ) {
    return this.moviesService.createMovie(body);
  }

  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body() body: UpdateMovieDto
  ) {
    return this.moviesService.updateMovie(+id, body);
  }

  @Delete(':id')
  deleteMoive(@Param('id') id: string) {
    return this.moviesService.deleteMovie(+id);
  }
}
