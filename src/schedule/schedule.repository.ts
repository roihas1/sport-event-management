import { DataSource, Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ScheduleRepository extends Repository<Schedule> {
  constructor(dataSource: DataSource) {
    super(Schedule, dataSource.createEntityManager());
  }
  async getAllGamesOfEvent(eventId: string): Promise<Schedule[]> {
    const query = this.createQueryBuilder('schedule');
    query.leftJoinAndSelect('schedule.team1', 'team1');
    query.leftJoinAndSelect('schedule.team2', 'team2');
    query.where('schedule.eventId = :eventId', { eventId });
    try {
      const games = await query.getMany();
      return games;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
