import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { User } from 'src/auth/user.entity';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Injectable()
export class EventsService {
  private logger = new Logger('EventsService');
  constructor(
    @InjectRepository(EventsRepository)
    private eventsRepository: EventsRepository,
  ) {}
  getEvents(user: User): Promise<Event[]> {
    return this.eventsRepository.getEvents(user);
  }
  createEvent(createEventDto: CreateEventDto, user: User): Promise<Event> {
    const event = this.eventsRepository.createEvent(createEventDto, user);
    return event;
  }

  async getEventById(id: string, user: User): Promise<Event> {
    const found = await this.eventsRepository.findOne({
      where: { id, createdBy: user },
    });
    if (!found) {
      this.logger.error(
        `Event with ID "${id}" not found for user "${user.username}".`,
      );
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    return found;
  }

  async deleteEventById(id: string, user: User): Promise<void> {
    const result = await this.eventsRepository.deleteEvent(id, user);
    if (result.affected == 0) {
      this.logger.error(
        `Failed to delete event with ID "${id}" for user "${user.username}." Not found.`,
      );
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    this.logger.log(
      `Event with ID "${id}" deleted by user "${user.username}".`,
    );
  }
  async updateEventStatus(
    id: string,
    updateEventStatus: UpdateEventStatusDto,
    user: User,
  ): Promise<void> {
    const { status } = updateEventStatus;
    const result = await this.eventsRepository.updateEventStatus(
      id,
      status,
      user,
    );
    if (result.affected == 0) {
      this.logger.error(
        `Failed to update status for event with ID "${id}" for user "${user.username}".`,
      );
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    this.logger.log(
      `Status of event with ID "${id}" updated to "${status}" by user "${user.username}".`,
    );
  }
}
