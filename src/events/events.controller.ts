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
import { GetUser } from 'src/auth/get-user.decorator';
import { Event } from './event.entity';
import { User } from 'src/auth/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Controller('events')
@UseGuards(AuthGuard(), RolesGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  getEvents(@GetUser() user: User): Promise<Event[]> {
    return this.eventsService.getEvents(user);
  }

  @Post()
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: User,
  ): Promise<Event> {
    return this.eventsService.createEvent(createEventDto, user);
  }

  @Get('/:id')
  getEventById(@Param('id') id: string, @GetUser() user: User): Promise<Event> {
    return this.eventsService.getEventById(id, user);
  }
  @Delete('/:id')
  deleteEventById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.eventsService.deleteEventById(id, user);
  }

  @Patch('/:id/status')
  updateEventStatus(
    @Param('id') id: string,
    @Body() updateEventStatus: UpdateEventStatusDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.eventsService.updateEventStatus(id, updateEventStatus, user);
  }
}
