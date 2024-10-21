import { DataSource, Repository } from 'typeorm';
import { Registration } from './registration.entity';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Event } from '../events/event.entity';
import { User } from '../auth/user.entity';
import { Team } from '../team/team.entity';

@Injectable()
export class RegistrationRepository extends Repository<Registration> {
  constructor(dataSource: DataSource) {
    super(Registration, dataSource.createEntityManager());
  }
  async createRegistration(
    event: Event,
    status: string,
    user: User,
    team: Team,
  ): Promise<void> {
    const registration = this.create({
      user: user,
      event,
      team,
      status,
    });

    try {
      await this.save(registration);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('team already register to this event');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getRegistrations(eventId: string, user: User): Promise<Registration[]> {
    const query = this.createQueryBuilder('registration');
    query.leftJoinAndSelect('registration.team', 'team');
    // query.where({ user });
    query.andWhere({ event: eventId });
    try {
      const registrations = await query.getMany();
      return registrations;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async getAllEventsUserRegitered(user: User): Promise<Registration[]> {
    const query = this.createQueryBuilder('registration');
    query.leftJoinAndSelect('registration.event', 'event');
    query.leftJoinAndSelect('registration.team', 'team');
    query.where('registration.userId = :userId', { userId: user.id });
    try {
      const events = await query.getMany();
      return events;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
