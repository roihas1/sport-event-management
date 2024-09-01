import { forwardRef, Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationRepository } from './registration.repository';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistrationRepository]),
    AuthModule,
    forwardRef(() => EventsModule),
    TeamModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationRepository],
  exports: [RegistrationService],
})
export class RegistrationModule {}
