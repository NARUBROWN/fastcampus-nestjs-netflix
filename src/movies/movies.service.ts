import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entites/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { MovieDetail } from './entites/movie-detail.entity';
import { Director } from 'src/directors/entites/director.entity';
import { Genre } from 'src/genres/entities/genre.entity';



@Injectable()
export class MoviesService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>
  ) {}

  findAll(title?: string) {
    if (!title) {
      return this.movieRepository.find({
        relations: ['director']
      });
    }
    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`)
      },
      relations: ['director']
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id
      },
      relations: ['detail', 'director']
    });
    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {

    const genres: Genre[] = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds)
      }
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException('존재하지 않는 ID의 장르입니다.');
    }

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
      detail: {
        detail: createMovieDto.detail
      },
      director,
      genres
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
    const {detail, directorId, genreIds, ...moiveRest} = updateMovieDto;

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
    
    let newGenres;

    if (genreIds) {
      const genres: Genre[] = await this.genreRepository.find({
        where: {
          id: In(genreIds)
        }
      });

       if (genreIds.length !== genres.length) {
        throw new NotFoundException(`존재하지 않는 장르가 있습니다. ids -> ${genres.map(genre => genre.id).join(',')}`)
       }

       newGenres = genres;
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
      relations: ['detail', 'director', 'genres']
    });

    if (!newMovie) {
        throw new NotFoundException('영화가 존재하지 않습니다.');
    }

    newMovie.genres = newGenres;

    await this.movieRepository.save(newMovie);

    return this.movieRepository.findOne({
      where: {
        id: uid
      },
      relations: ['detail', 'director', 'genres']
    });;
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
