import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Registration } from 'src/registration/registration.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  teamName: string;

  @Column('simple-array')
  members: string[];

  @OneToMany(() => Registration, (registration) => registration.team, {
    nullable: true,
  })
  registrations: Registration[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'userId' })
  @Exclude({ toPlainOnly: true })
  user: User;
}
