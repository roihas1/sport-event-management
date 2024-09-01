// registration.service.ts
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Registration } from './registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { EventsService } from '../events/events.service';
import { RegistrationRepository } from './registration.repository';
import { TeamService } from '../team/team.service';

@Injectable()
export class RegistrationService {
  private logger = new Logger('RegistrationService', { timestamp: true });
  constructor(
    @InjectRepository(RegistrationRepository)
    private readonly registrationRepository: RegistrationRepository,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly teamService: TeamService,
  ) {}
  async getNumOfTeams(eventId: string, user: User): Promise<number> {
    const event = await this.eventsService.getEventById(eventId, user);
    const currentParticipantsCount = await this.registrationRepository.count({
      where: { event },
    });
    return currentParticipantsCount;
  }
  async register(
    eventId: string,
    createRegistrationDto: CreateRegistrationDto,
    user: User,
  ): Promise<void> {
    try {
      const event = await this.eventsService.getEventById(eventId, user);
      const currentParticipantsCount = await this.registrationRepository.count({
        where: { event },
      });

      if (currentParticipantsCount >= event.maxParticipants) {
        this.logger.warn(
          `Event "${eventId}" has reached its maximum number of participants. User "${user.username}" cannot register more participants.`,
        );
        throw new ConflictException(
          'Event has reached its maximum number of participants.',
        );
      }
      const team = await this.teamService.getTeamByName(
        createRegistrationDto.teamName,
        user,
      );
      await this.registrationRepository.createRegistration(
        event,
        createRegistrationDto.status,
        user,
        team,
      );
      this.logger.verbose(
        `User "${user.username}" successfully registered a team "${createRegistrationDto.teamName}" for event "${eventId}".`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to register team for event "${eventId}" by user "${user.username}".`,
        error.stack,
      );
    }
  }
  getAllEventsUserRegitered(user: User): Promise<Registration[]> {
    return this.registrationRepository.getAllEventsUserRegitered(user);
  }
  async getRegistrations(eventId: string, user: User): Promise<Registration[]> {
    try {
      const registrations = await this.registrationRepository.getRegistrations(
        eventId,
        user,
      );
      this.logger.verbose(
        `User "${user.username}" successfully retrieved ${registrations.length} registrations for event "${eventId}".`,
      );
      return registrations;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve registrations for event "${eventId}" by user "${user.username}".`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteRegistration(
    eventId: string,
    teamName: string,
    user: User,
  ): Promise<void> {
    try {
      const team = await this.teamService.getTeamByName(teamName, user);
      if (!team) {
        this.logger.warn(
          `Team with the name "${teamName}" not found for user "${user.username}".`,
        );
        throw new NotFoundException(
          `Team with the name: "${teamName}" not found.`,
        );
      }

      const event = await this.eventsService.getEventById(eventId, user);
      if (!event) {
        this.logger.warn(
          `Event with id "${eventId}" not found for user "${user.username}".`,
        );
        throw new NotFoundException(`Event with id: "${eventId}" not found.`);
      }

      await this.registrationRepository.delete({
        event,
        team,
        user,
      });

      this.logger.verbose(
        `User "${user.username}" successfully deleted registration for team "${teamName}" from event "${eventId}".`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete registration for team "${teamName}" from event "${eventId}" by user "${user.username}".`,
        error.stack,
      );
      throw error;
    }
  }
}
