// registration.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { Registration } from './registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { EventsService } from 'src/events/events.service';
import { RegistrationRepository } from './registration.repository';
import { TeamService } from 'src/team/team.service';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(RegistrationRepository)
    private readonly registrationRepository: RegistrationRepository,
    private readonly eventsService: EventsService,
    private readonly teamService: TeamService,
  ) {}

  async register(
    eventId: string,
    createRegistrationDto: CreateRegistrationDto,
    user: User,
  ): Promise<void> {
    const event = await this.eventsService.getEventById(eventId, user);
    const currentParticipantsCount = await this.registrationRepository.count({
      where: { event },
    });

    if (currentParticipantsCount >= event.maxParticipants) {
      throw new ConflictException(
        'Event has reached its maximum number of participants.',
      );
    }
    const team = await this.teamService.getTeamByName(
      createRegistrationDto.teamName,
      user,
    );
    return this.registrationRepository.createRegistration(
      event,
      createRegistrationDto.status,
      user,
      team,
    );
  }

  async getRegistrations(eventId: string, user: User): Promise<Registration[]> {
    return this.registrationRepository.getRegistrations(eventId, user);
  }
}
