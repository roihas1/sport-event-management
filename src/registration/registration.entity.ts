// registration.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Event } from '../events/event.entity';
import { Exclude } from 'class-transformer';
import { Team } from '../team/team.entity';

@Entity()
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'userId' })
  @Exclude({ toPlainOnly: true })
  user: User;

  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => Team, { eager: true })
  team: Team;

  @Column()
  status: string;
}
