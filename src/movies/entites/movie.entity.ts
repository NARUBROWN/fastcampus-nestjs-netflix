import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import { BaseTable } from "../../commons/entites/base-table.entity";
import { MovieDetail } from "./movie-detail.entity";
import { Director } from "src/directors/entites/director.entity";
import { Genre } from "src/genres/entities/genre.entity";




@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  title: string;

  @ManyToMany(
    () => Genre,
    (genre) => genre.movies,
    {
      cascade: true
    }
  )
  @JoinTable()
  genres: Genre[];

  @OneToOne(
    () => MovieDetail,
    moviedetail => moviedetail.id,
    {
      cascade: true,
      nullable: false
    }
  )
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(
    () => Director,
    director => director.movies,
    {
      cascade: true,
      nullable: false
    }
  )
  director: Director;
}
