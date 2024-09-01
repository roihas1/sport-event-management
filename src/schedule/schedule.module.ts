import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { TeamModule } from '../team/team.module';
import { ScheduleRepository } from './schedule.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationModule } from '../registration/registration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleRepository]),
    AuthModule,
    EventsModule,
    TeamModule,
    RegistrationModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule {}
