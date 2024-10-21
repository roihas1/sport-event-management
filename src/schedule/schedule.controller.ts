import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { ScheduleService } from './schedule.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateMatchScoreDto } from './dto/update-match-score.dto';
import { Schedule } from './schedule.entity';

@Controller('schedule')
@UseGuards(AuthGuard(), RolesGuard)
export class ScheduleController {
  private logger = new Logger('ScheduleController', { timestamp: true });
  constructor(private scheduleService: ScheduleService) {}

  @Post('create/:id')
  async createSchedule(
    @Param('id') eventId: string,
    @Body() createScheduleDto: CreateScheduleDto,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" is creating a single elimination for event ID "${eventId}". Data: ${JSON.stringify(createScheduleDto)}`,
    );
    this.scheduleService.createSingleEliminationBracket(
      eventId,
      createScheduleDto,
      user,
    );
  }
  @Get('games/game/:id')
  getMatch(@Param('id') matchId: string): Promise<Schedule> {
    this.logger.verbose(`Try to get  match ID "${matchId}".`);
    const foundMatch = this.scheduleService.getMatch(matchId);
    return foundMatch;
  }
  @Get('games/:eventId')
  getAllGamesOfEvent(
    @Param('eventId') eventId: string,
    @GetUser() user: User,
  ): Promise<Schedule[]> {
    this.logger.verbose(
      `User "${user.username}" is retrieving all games for event with id:"${eventId}"`,
    );
    return this.scheduleService.getAllGamesOfEvent(eventId);
  }

  @Delete('games/:eventId')
  deleteAllEventGames(
    @Param('eventId') eventId: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" is deleting all games for event with id:"${eventId}"`,
    );
    return this.scheduleService.deleteAllEventGames(eventId);
  }
  @Delete('games/team/:teamId')
  deleteAllTeamGames(@Param('teamId') teamId: string, @GetUser() user: User) {
    this.logger.verbose(
      `User "${user.username}" is deleting all games for team with id:"${teamId}"`,
    );
  }

  @Patch('update/:id/score')
  updateMatchScore(
    @Param('id') matchId: string,
    @Body() updateMatchScoreDto: UpdateMatchScoreDto,
  ): Promise<number[]> {
    this.logger.verbose(
      `Updating score for match ID "${matchId}". Data: ${JSON.stringify(updateMatchScoreDto)}`,
    );
    return this.scheduleService.updateMatchScore(matchId, updateMatchScoreDto);
  }

}
