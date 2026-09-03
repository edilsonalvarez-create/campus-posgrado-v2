import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  ForeignKey,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { Grade } from '../../grades/entities/grade.entity';

export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => User)
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.submissions, { onDelete: 'CASCADE' })
  user: User;

  @ForeignKey(() => Resource)
  @Column()
  resourceId: string;

  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  resource: Resource;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status: SubmissionStatus;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Grade, (grade) => grade.submission, { nullable: true })
  grade: Grade;
}
