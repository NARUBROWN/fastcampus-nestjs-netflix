import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseInterceptors } from '@nestjs/common';
import { DirectorsService } from './directors.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';

@Controller('directors')
@UseInterceptors(ClassSerializerInterceptor)
export class DirectorsController {
  constructor(private readonly directorsService: DirectorsService) {}

  @Get()
  findAll() {
    return this.directorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.directorsService.findOne(id);
  }

  @Post()
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorsService.create(createDirectorDto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDirectorDto: UpdateDirectorDto) {
    return this.directorsService.update(id, updateDirectorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.directorsService.remove(id);
  }
}
