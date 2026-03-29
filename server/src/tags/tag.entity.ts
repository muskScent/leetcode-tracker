import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Problem } from '../problems/problem.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Problem, (problem) => problem.tags)
  problems: Problem[];
}
