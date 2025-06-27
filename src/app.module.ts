import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
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
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { envVariables } from './commons/const/env.const';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { RBACGuard } from './auth/guard/rbac.guard';
import { ResponseTimeInterceptor } from './commons/interceptor/response-time.interceptor';
import { ForbiddenExceptionFilter } from './commons/filter/forbidden.filter';
import { QueryFailedExceptionFilter } from './commons/filter/query-failed.filter';

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
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required()
      })
    }),
    TypeOrmModule.forRootAsync({
        useFactory: (configService: ConfigService) => ({
          type: configService.get<string>(envVariables.dbType) as 'postgres',
          host: configService.get<string>(envVariables.dbHost),
          port: configService.get<number>(envVariables.dbPort),
          username: configService.get<string>(envVariables.dbUsername),
          password: configService.get<string>(envVariables.dbPassword),
          database: configService.get<string>(envVariables.dbDatabase),
          entities: [
            Movie, MovieDetail, Director, Genre, User
          ],
          synchronize: true
        }),
        inject: [ConfigService]
    }),
    MoviesModule,
    DirectorsModule,
    GenresModule,
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter
    }
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      BearerTokenMiddleware
    )
    .exclude({
      path: 'auth/login',
      method: RequestMethod.POST
    },{
      path: 'auth/register',
      method: RequestMethod.POST
    })
    .forRoutes('*')
  }
}
