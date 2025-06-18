import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entites/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, InsertResult, Like, Not, Repository } from 'typeorm';
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

  async findAll(title?: string) {
    const qb = await this.movieRepository.createQueryBuilder('movie')
    .leftJoinAndSelect('movie.director', 'director')
    .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    return await qb.getManyAndCount();
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.createQueryBuilder('movie')
    .leftJoinAndSelect('movie.director', 'director')
    .leftJoinAndSelect('movie.genres', 'genres')
    .leftJoinAndSelect('movie.detail', 'detail')
    .where('movie.id = :id', { id })
    .getOne();

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

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

    const movieDetail: InsertResult = await this.movieDetailRepository.createQueryBuilder()
    .insert()
    .into(MovieDetail)
    .values({
      detail: createMovieDto.detail
    })
    .execute();

    const movieDetailId = movieDetail.identifiers[0].id;

    const movie = await this.movieRepository.createQueryBuilder()
    .insert()
    .into(Movie)
    .values({
      title: createMovieDto.title,
      detail: {
        id: movieDetailId
      },
      director
    })
    .execute();

    const movieId = movie.identifiers[0].id;

    await this.movieRepository.createQueryBuilder()
    .relation(Movie, 'genres')
    .of(movieId)
    .add(genres.map(genres => genres.id));

    return await this.movieRepository.findOne({
      where: {
        id: movieId
      },
      relations: ['detail', 'director', 'genres']
    });
  }

  async update(uid: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: uid
      },
      relations: ['detail', 'genres']
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

    await this.movieRepository.createQueryBuilder()
    .update(Movie)
    .set(movieUpateFields)
    .where('id = :id', {id : uid})
    .execute();


    if(detail) {
      await this.movieDetailRepository.createQueryBuilder()
      .update(MovieDetail)
      .set({
        detail: detail
      })
      .where('id = :id', {id : movie.detail.id})
      .execute();
    }

    if (newGenres) {
        await this.movieRepository.createQueryBuilder()
        .relation(Movie, 'genres')
        .of(uid)
        .addAndRemove(newGenres.map(genre => genre.id), movie.genres.map(genre => genre.id))
    }

    return this.movieRepository.findOne({
      where: {
        id: uid
      },
      relations: ['detail', 'director', 'genres']
    });
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

    await this.movieRepository.createQueryBuilder()
    .delete()
    .from(Movie)
    .where('id = :id', { id : uid })
    .execute()
    await this.movieDetailRepository.delete(movieDetail.id);
  }
}
