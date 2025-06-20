import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepsitory: Repository<Genre>
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const genre = await this.genreRepsitory.findOne({
      where: {
        name: createGenreDto.name
      }
    });

    if (genre) {
      throw new NotFoundException(`이미 존재하는 장르입니다.`);
    }

    return this.genreRepsitory.save(createGenreDto);
  }

  findAll() {
    return this.genreRepsitory.find();
  }

  async findOne(id: number) {
    const genre = await this.genreRepsitory.findOne({
      where: {
        id
      }
    });

    if (!genre) {
      throw new NotFoundException(`주어진 ${id}번 장르를 찾을 수 없습니다.`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepsitory.findOne({
      where: {
        id
      }
    });

    if (!genre) {
      throw new NotFoundException(`주어진 ${id}번 장르를 찾을 수 없습니다.`);
    }

    await this.genreRepsitory.update(
      {id}, updateGenreDto
    )

    const newGenre = await this.genreRepsitory.findOne({
      where: {
        id
      }
    });

    return newGenre; 
  }

  async remove(id: number) {
    const genre = await this.genreRepsitory.findOne({
      where: {
        id
      }
    });

    if (!genre) {
      throw new NotFoundException(`주어진 ${id}번 장르를 찾을 수 없습니다.`);
    }
    
    await this.genreRepsitory.delete(id);
    return id;
  }
}
