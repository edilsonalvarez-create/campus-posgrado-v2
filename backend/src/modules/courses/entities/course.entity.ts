import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ForeignKey,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Module as CourseModule } from './module.entity';
import { Enrollment } from './enrollment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ForeignKey(() => User)
  @Column({ nullable: true })
  instructorId: string;

  @ManyToOne(() => User, (user) => user.coursesCreated, { nullable: true })
  instructor: User;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => CourseModule, (module) => module.course, {
    cascade: true,
    eager: true,
  })
  modules: CourseModule[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, {
    cascade: true,
  })
  enrollments: Enrollment[];
}
