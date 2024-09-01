import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsOptional } from 'class-validator';
import { User } from '../auth/user.entity';
import { Exclude } from 'class-transformer';
import { SportType } from './sport-types.enum';
import { eventStatus } from './event-status.enum';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column({ nullable: true })
  eventDescription: string;

  @Column({
    type: 'enum',
    enum: SportType,
    nullable: true,
  })
  sportType: SportType;

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
