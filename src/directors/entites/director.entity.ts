import { BaseTable } from "src/commons/entites/base-table.entity";
import { Movie } from "src/movies/entites/movie.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Director extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    dob: Date;

    @Column()
    nationality: string

    @OneToMany(
        () => Movie,
        movie => movie.director,
    )
    movies: Movie[]

}