import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Movie } from './movies/entites/movie.entity';
import { MovieDetail } from './movies/entites/movie-detail.entity';
import { DirectorsModule } from './directors/directors.module';
import { Director } from './directors/entites/director.entity';
import { GenresModule } from './genres/genres.module';
import { Genre } from './genres/entities/genre.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required()
      })
    }),
    TypeOrmModule.forRootAsync({
        useFactory: (configService: ConfigService) => ({
          type: configService.get<string>('DB_TYPE') as 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [
            Movie, MovieDetail, Director, Genre
          ],
          synchronize: true
        }),
        inject: [ConfigService]
    }),
    MoviesModule,
    DirectorsModule,
    GenresModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
