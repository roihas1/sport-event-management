// registration.controller.ts
import { Controller, Post, Param, Body, Get, UseGuards } from '@nestjs/common';
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
  constructor(private readonly registrationService: RegistrationService) {}

  @Post(':id/register')
  async register(
    @Param('id') eventId: string,
    @Body() createRegistrationDto: CreateRegistrationDto,
    @GetUser() user: User,
  ): Promise<void> {
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
    return this.registrationService.getRegistrations(eventId, user);
  }
}
