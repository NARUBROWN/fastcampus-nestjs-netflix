import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entites/movie.entity';
import { MovieDetail } from './entites/movie-detail.entity';
import { Director } from 'src/directors/entites/director.entity';
import { Genre } from 'src/genres/entities/genre.entity';
import { CommonModule } from 'src/commons/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie, MovieDetail, Director, Genre
    ]),
    CommonModule,
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'movie'),
        filename: (req, file, cb) => {
          const split = file.originalname.split('.');

          let extension = 'mp4';

          if (split.length > 1) {
            extension = split[split.length - 1];
          }

          cb(null, `${v4()}_${Date.now()}.${extension}`);
        }
      }),
    })
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
