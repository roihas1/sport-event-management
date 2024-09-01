import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../auth/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { eventStatus } from './event-status.enum';

@Injectable()
export class EventsRepository extends Repository<Event> {
  private logger = new Logger('Eventsrepository', { timestamp: true });
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
      this.logger.error(
        `Failed to get events for user "${user.username}".`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  async getOtherEvents(user: User): Promise<Event[]> {
    const query = this.createQueryBuilder('event');
    query.where('event.createdBy != :userId', { userId: user.id });
    try {
      const events = await query.getMany();
      return events;
    } catch (error) {
      this.logger.error(
        `Failed to get events for user "${user.username}".`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  async createEvent(
    createEventDto: CreateEventDto,
    user: User,
  ): Promise<Event> {
    const {
      eventName,
      description,
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
      eventDescription: description,
      date,
      time,
      location,
      maxParticipants,
      registrationDeadline,
      createdBy: user,
    });

    try {
      const savedEvent = await this.save(event);

      this.logger.verbose(
        `Event "${savedEvent.eventName}" created successfully by user "${user.username}".`,
      );

      return savedEvent;
    } catch (error) {
      // Logging for error
      this.logger.error(
        `Failed to create event for user "${user.username}".`,
        error.stack,
      );

      throw new InternalServerErrorException();
    }
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
