import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPiep } from './pipes/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/users/entities/user.entity';
import { GetMoviesDto } from './dto/get-moives.dto';

@Controller('movies')
@UseInterceptors(ClassSerializerInterceptor)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @Public()
  getMovies(
    @Query() dto: GetMoviesDto
  ) {
    return this.moviesService.findAll(dto);
  }

  @Public()
  @Get(':id')
  getMovie(@Param('id', ParseIntPipe) id: number) {
      return this.moviesService.findOne(id);
  }

  @RBAC(Role.admin)
  @Post()
  postMovie(
    @Body() body: CreateMovieDto
  ) {
    return this.moviesService.create(body);
  }

  @Patch(':id')
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto
  ) {
    return this.moviesService.update(id, body);
  }

  @Delete(':id')
  deleteMoive(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}
