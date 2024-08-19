import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Event } from './event.entity';
import { User } from 'src/auth/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { eventStatus } from './event-status.enum';

@Injectable()
export class EventsRepository extends Repository<Event> {
  constructor(dataSource: DataSource) {
    super(Event, dataSource.createEntityManager());
  }
  async getEvents(user: User): Promise<Event[]> {
    const query = this.createQueryBuilder('event');
    query.where({ createdBy: user });
    try {
      const events = await query.getMany();
      return events;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async createEvent(
    createEventDto: CreateEventDto,
    user: User,
  ): Promise<Event> {
    const {
      eventName,
      sportType,
      date,
      time,
      location,
      maxParticipants,
      registrationDeadline,
    } = createEventDto;

    const event = this.create({
      eventName,
      sportType,
      date,
      time,
      location,
      maxParticipants,
      registrationDeadline,
      createdBy: user,
    });

    return await this.save(event);
  }
  async deleteEvent(id: string, user: User): Promise<DeleteResult> {
    return await this.delete({ id, createdBy: user });
  }
  async updateEventStatus(
    id: string,
    status: eventStatus,
    user: User,
  ): Promise<UpdateResult> {
    return await this.update(id, { status, createdBy: user });
  }
}
