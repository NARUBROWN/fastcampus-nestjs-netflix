import { Injectable, NotFoundException } from '@nestjs/common';

export interface Movie {
  id: number;
  title: string;
}


@Injectable()
export class MoviesService {
  
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '해리포터2',
    }
  ];
    
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

  createMovie(title: string) {
    const moive: Movie = {
          id: this.idCounter++,
          title: title
        }
    
        this.movies.push(
          moive
        )
    
        return moive;
  }

  updateMovie(uid: number, title: string) {
    const movie = this.movies.find(m => m.id === uid);
    
        if(!movie) {
          throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
        }
    
        Object.assign(movie, {
          title: title
        });
    
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
