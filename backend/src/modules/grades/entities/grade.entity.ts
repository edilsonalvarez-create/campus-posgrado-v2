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
import { Submission } from '../../submissions/entities/submission.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => Submission)
  @Column({ unique: true })
  submissionId: string;

  @OneToOne(() => Submission, (submission) => submission.grade, {
    onDelete: 'CASCADE',
  })
  submission: Submission;

  @ForeignKey(() => User)
  @Column()
  gradedById: string;

  @ManyToOne(() => User, (user) => user.gradesGiven, { onDelete: 'SET NULL' })
  gradedBy: User;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @CreateDateColumn()
  gradedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
