import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { GetUser } from '../auth/get-user.decorator';
import { Event } from './event.entity';
import { User } from '../auth/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { Logger } from '@nestjs/common';
import { Registration } from '../registration/registration.entity';

@Controller('events')
@UseGuards(AuthGuard(), RolesGuard)
export class EventsController {
  private logger = new Logger('EventsController');
  constructor(private eventsService: EventsService) {}

  @Get()
  async getEvents(@GetUser() user: User): Promise<Event[]> {
    this.logger.verbose(`User "${user.username}" retrieving all his events.`);
    return await this.eventsService.getEvents(user);
  }
  @Get('/others')
  async getOtherEvents(@GetUser() user: User): Promise<Event[]> {
    this.logger.verbose(`User "${user.username}" retrieving all other events.`);
    return await this.eventsService.getOtherEvents(user);
  }

  @Post()
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: User,
  ): Promise<Event> {
    this.logger.verbose(
      `User "${user.username}" creating new event. Data: ${JSON.stringify(createEventDto)}.`,
    );
    return this.eventsService.createEvent(createEventDto, user);
  }
  @Get(':id')
  getEventById(@Param('id') id: string, @GetUser() user: User): Promise<Event> {
    this.logger.verbose(
      `User "${user.username}" retrieving event with id: ${id}.`,
    );
    return this.eventsService.getEventById(id, user);
  }

  @Delete('/:id')
  deleteEventById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" deleting event with id: ${id}.`,
    );
    return this.eventsService.deleteEventById(id, user);
  }

  @Patch('/:id/status')
  updateEventStatus(
    @Param('id') id: string,
    @Body() updateEventStatus: UpdateEventStatusDto,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" updating status of event with id: ${id} to "${updateEventStatus.status}".`,
    );
    return this.eventsService.updateEventStatus(id, updateEventStatus, user);
  }
  @Get('/user/registeredEvents')
  getAllEventsUserRegitered(@GetUser() user: User): Promise<Registration[]> {
    this.logger.verbose(
      `Fetching all events registered by user: ${user.username}`,
    );
    return this.eventsService.getAllEventsUserRegitered(user);
  }
}
