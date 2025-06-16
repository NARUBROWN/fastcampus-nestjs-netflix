import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
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
    @Body('title') title: string
  ) {
    return this.moviesService.createMovie(title);
  }

  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body('title') title: string
  ) {
    return this.moviesService.updateMovie(+id, title);
  }

  @Delete(':id')
  deleteMoive(@Param('id') id: string) {
    return this.moviesService.deleteMovie(+id);
  }
}
