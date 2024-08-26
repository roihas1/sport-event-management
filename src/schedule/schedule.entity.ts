// schedule.entity.ts
import { Team } from 'src/team/team.entity';
import { Event } from 'src/events/event.entity';
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

  //   @ManyToOne(() => User, { eager: true, nullable: false })
  //   @JoinColumn({ name: 'userId' })
  //   @Exclude({ toPlainOnly: true })
  //   user: User;
}
