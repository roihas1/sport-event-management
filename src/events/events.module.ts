import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventsRepository]), AuthModule],
  providers: [EventsService, EventsRepository],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
