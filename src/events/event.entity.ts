import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { eventStatus } from './event-status.enum';
import { IsOptional } from 'class-validator';
import { User } from 'src/auth/user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column()
  sportType: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column()
  @IsOptional()
  location: string;

  @Column()
  maxParticipants: number;

  @Column({ type: 'date' })
  registrationDeadline: string;

  @Column({
    type: 'enum',
    enum: eventStatus,
    default: eventStatus.ACTIVE,
  })
  status: eventStatus;

  @ManyToOne(() => User, (user) => user.events, { eager: false })
  @Exclude({ toPlainOnly: true })
  createdBy: User;
}
