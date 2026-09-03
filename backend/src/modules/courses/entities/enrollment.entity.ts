import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ForeignKey,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';

export enum EnrollmentRole {
  STUDENT = 'student',
  TEACHING_ASSISTANT = 'ta',
}

@Entity('enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => User)
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  user: User;

  @ForeignKey(() => Course)
  @Column()
  courseId: string;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @Column({
    type: 'enum',
    enum: EnrollmentRole,
    default: EnrollmentRole.STUDENT,
  })
  role: EnrollmentRole;

  @CreateDateColumn()
  enrolledAt: Date;
}
