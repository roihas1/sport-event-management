import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { ScheduleService } from './schedule.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateMatchScoreDto } from './dto/update-match-score.dto';

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

  @Patch('update/:id/score')
  updateMatchScore(
    @Param('id') matchId: string,
    @Body() updateMatchScoreDto: UpdateMatchScoreDto,
  ): Promise<void> {
    this.logger.verbose(
      `Updating score for match ID "${matchId}". Data: ${JSON.stringify(updateMatchScoreDto)}`,
    );
    return this.scheduleService.updateMatchScore(matchId, updateMatchScoreDto);
  }
}
