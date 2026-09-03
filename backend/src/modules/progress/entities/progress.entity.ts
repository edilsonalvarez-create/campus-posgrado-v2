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
import { Resource } from '../../resources/entities/resource.entity';

@Entity('progress')
@Unique(['userId', 'resourceId'])
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => User)
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ForeignKey(() => Resource)
  @Column()
  resourceId: string;

  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  resource: Resource;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
