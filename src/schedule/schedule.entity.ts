// schedule.entity.ts
import { Team } from '../team/team.entity';
import { Event } from '../events/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, { nullable: true })
  team1: Team;

  @ManyToOne(() => Team, { nullable: true })
  team2: Team;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  winnerId: string;

  @Column('simple-array', { nullable: true })
  score: number[];

  @Column({ type: 'int', nullable: false, default: 0 })
  round: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  maxRounds: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  matchNumber: number;
}
