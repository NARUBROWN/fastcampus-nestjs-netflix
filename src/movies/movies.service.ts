import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entites/movie.entity';



@Injectable()
export class MoviesService {
  
  private movies: Movie[] = [];

  constructor() {
    const movie1 = new Movie();
    movie1.title = '해리포터';
    movie1.id = 1;
    movie1.genre = 'fantasy';

    const movie2 = new Movie();
    movie2.title = '반지의 제왕';
    movie2.id = 2;
    movie2.genre = 'action';


    this.movies.push(movie1, movie2);
  }
    
  private idCounter = 3;

  getManyMovies(title?: string) {
    if (!title) {
          return this.movies;
        }
    
        return this.movies.filter(m => m.title === title);
  }

  getMoiveById(id: number) {
        const movie = this.movies.find((m) => m.id === id);
    
        if(!movie) {
          throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
        }
    
        return movie;
  }

  createMovie(createMovieDto: CreateMovieDto) {
    const moive: Movie = {
          id: this.idCounter++,
          ...createMovieDto,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
    
        this.movies.push(
          moive
        )
    
        return moive;
  }

  updateMovie(uid: number, updateMovieDto: UpdateMovieDto) {
    const movie = this.movies.find(m => m.id === uid);
    
        if(!movie) {
          throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
        }
    
        Object.assign(movie, updateMovieDto);
    
        return movie;
  }

  deleteMovie(uid: number) {
    const movieIndex = this.movies.findIndex(m => m.id === uid);

    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    
    this.movies.splice(movieIndex, 1);

    return uid;
  }
}
