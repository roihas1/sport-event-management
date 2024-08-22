import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationRepository } from './registration.repository';
import { AuthModule } from 'src/auth/auth.module';
import { EventsModule } from 'src/events/events.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistrationRepository]),
    AuthModule,
    EventsModule,
    TeamModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationRepository],
})
export class RegistrationModule {}
