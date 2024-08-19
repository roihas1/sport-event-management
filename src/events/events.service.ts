import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { User } from 'src/auth/user.entity';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Injectable()
export class EventsService {
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
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    return found;
  }

  async deleteEventById(id: string, user: User): Promise<void> {
    const result = await this.eventsRepository.deleteEvent(id, user);
    if (result.affected == 0) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
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
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
  }
}
