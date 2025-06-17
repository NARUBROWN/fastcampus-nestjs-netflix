import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import { BaseTable } from "../../commons/entites/base-table.entity";
import { MovieDetail } from "./movie-detail.entity";
import { Director } from "src/directors/entites/director.entity";




@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(
    () => MovieDetail,
    moviedetail => moviedetail.id,
    {
      cascade: true
    }
  )
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(
    () => Director,
    director => director.movies,
    {
      cascade: true
    }
  )
  director: Director;
}
