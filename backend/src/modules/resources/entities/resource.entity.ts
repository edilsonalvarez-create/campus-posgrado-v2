import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ForeignKey,
} from 'typeorm';
import { Module as CourseModule } from '../../courses/entities/module.entity';

export enum ResourceType {
  LECTURE = 'lecture',
  VIDEO = 'video',
  EXERCISE = 'exercise',
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => CourseModule)
  @Column()
  moduleId: string;

  @ManyToOne(() => CourseModule, (module) => module.resources, {
    onDelete: 'CASCADE',
  })
  module: CourseModule;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  type: ResourceType;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  source: string; // Autor, libro, etc.

  @Column({ default: 1 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
