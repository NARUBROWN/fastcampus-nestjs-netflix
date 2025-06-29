import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, UseGuards, Request, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPiep } from './pipes/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/users/entities/user.entity';
import { GetMoviesDto } from './dto/get-moives.dto';
import { CacheInterceptor } from 'src/commons/interceptor/cache.interceptor';
import { TransactionInterceptor } from 'src/commons/interceptor/transaction.interceptor';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MovieFilePipe } from './pipe/movie-file.pipe';

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
  
  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FileInterceptor('movie', {
    limits: {
      fileSize: 20000000000000,
    },
    fileFilter(req, file, callback) {
      console.log(file);
      if (file.mimetype !== 'video/mp4') {
        return callback(new BadRequestException('MP4 타입만 업로드 가능합니다.'), false);
      }
      return callback(null, true);
    }
  }))
  postMovie(
    @Body() body: CreateMovieDto,
    @Request() req,
    @UploadedFile() movie: Express.Multer.File
  ) {
    return this.moviesService.create(body, movie.filename, req.queryRunner);
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
