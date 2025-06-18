import { BaseTable } from "src/commons/entites/base-table.entity";
import { Movie } from "src/movies/entites/movie.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Genre extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(
        () => Movie,
        (movie) => movie.genres
    )
    movies: Movie[];
}
