import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { AuthModule } from '../auth/auth.module';
import { RegistrationModule } from '../registration/registration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventsRepository]),
    AuthModule,
    RegistrationModule,
  ],
  providers: [EventsService, EventsRepository],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
