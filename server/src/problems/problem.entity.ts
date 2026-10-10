import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum Status {
  Unsolved = 'Unsolved',
  Attempted = 'Attempted',
  Solved = 'Solved',
}

export enum Performance {
  Good = 'Good',
  Average = 'Average',
  Bad = 'Bad',
}

@Entity()
export class Problem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'varchar' })
  leetcodeUrl: string | null;

  @Column({ type: 'simple-enum', enum: Difficulty })
  difficulty: Difficulty;

  @Column({ type: 'simple-enum', enum: Status, default: Status.Unsolved })
  status: Status;

  @Column({ type: 'simple-enum', enum: Performance, nullable: true })
  performance: Performance | null;

  @ManyToOne(() => Category, (category) => category.problems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category | null;

  @ManyToMany(() => Tag, (tag) => tag.problems)
  @JoinTable({ name: 'problem_tag' })
  tags: Tag[];

  @Column({ type: 'text', nullable: true })
  keyTechniques: string | null;

  @Column({ type: 'text', nullable: true })
  performanceComment: string | null;

  @Column({ default: 0 })
  timesAttempted: number;

  @Column({ type: 'datetime', nullable: true })
  nextReviewAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastReviewedAt: Date | null;

  @Column({ default: 0 })
  reviewInterval: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
