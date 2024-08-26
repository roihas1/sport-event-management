// registration.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  UseGuards,
  Delete,
  Logger,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from './registration.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('events')
@UseGuards(AuthGuard(), RolesGuard)
export class RegistrationController {
  private logger = new Logger('RegistrationController', { timestamp: true });
  constructor(private readonly registrationService: RegistrationService) {}

  @Post(':id/register')
  async register(
    @Param('id') eventId: string,
    @Body() createRegistrationDto: CreateRegistrationDto,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" is attempting to register for event "${eventId}" with data: ${JSON.stringify(
        createRegistrationDto,
      )}`,
    );
    return this.registrationService.register(
      eventId,
      createRegistrationDto,
      user,
    );
  }

  @Get(':id/registrations')
  async getRegistrations(
    @Param('id') eventId: string,
    @GetUser() user: User,
  ): Promise<Registration[]> {
    this.logger.verbose(
      `User "${user.username}" is retrieving registrations for event "${eventId}".`,
    );
    return this.registrationService.getRegistrations(eventId, user);
  }
  @Delete('/:id/registration/:name')
  deleteRegistration(
    @Param('id') eventId: string,
    @Param('name') teamName: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" is attempting to delete registration for team "${teamName}" from event "${eventId}".`,
    );
    return this.registrationService.deleteRegistration(eventId, teamName, user);
  }
}
