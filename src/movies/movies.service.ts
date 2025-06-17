import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entites/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { MovieDetail } from './entites/movie-detail.entity';
import { Director } from 'src/directors/entites/director.entity';



@Injectable()
export class MoviesService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>
  ) {}

  findAll(title?: string) {
    if (!title) {
      return this.movieRepository.find();
    }
    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`)
      }
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id
      },
      relations: ['detail']
    });
    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {

    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId
      }
    })

    if(!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        detail: createMovieDto.detail
      },
      director
    });

    return movie;
  }

  async update(uid: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: uid
      },
      relations: ['detail']
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    const {detail, directorId, ...moiveRest} = updateMovieDto;

    let newDirector;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {
          id: directorId
        }
      });

      if(!director) {
        throw new NotFoundException('존재하지 않는 감독의 ID입니다.');
      }

      newDirector = director;
    }
    
    const movieUpateFields = {
      ...moiveRest,
      ...(newDirector && {director: newDirector})
    }

    await this.movieRepository.update(
      {id: uid}, movieUpateFields
    )

    if(detail) {
      await this.movieDetailRepository.update({id: movie.detail.id}, {detail: detail})
    }

    const newMovie = await this.movieRepository.findOne({
      where: {
        id: uid
      },
      relations: ['detail', 'director']
    });

    return newMovie;
  }

  async remove(uid: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: uid
      },
      relations: ['detail']
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    const movieDetail = await this.movieDetailRepository.findOne({
      where: {
        id: movie.detail.id
      }
    });

    if (!movieDetail) {
      throw new NotFoundException('존재하지 않는 Detail 입니다.');
    }

    await this.movieRepository.delete(uid);
    await this.movieDetailRepository.delete(movieDetail.id);
  }
}
