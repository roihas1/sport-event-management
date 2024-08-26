import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { AuthModule } from 'src/auth/auth.module';
import { EventsModule } from 'src/events/events.module';
import { TeamModule } from 'src/team/team.module';
import { ScheduleRepository } from './schedule.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationModule } from 'src/registration/registration.module';

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
