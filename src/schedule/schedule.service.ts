import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsService } from '../events/events.service';
import { TeamService } from '../team/team.service';
import { ScheduleRepository } from './schedule.repository';
import { RegistrationService } from '../registration/registration.service';
import { User } from '../auth/user.entity';
import { Team } from '../team/team.entity';
import { Schedule } from './schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateMatchScoreDto } from './dto/update-match-score.dto';

@Injectable()
export class ScheduleService {
  private logger = new Logger('ScheduleService', { timestamp: true });
  constructor(
    @InjectRepository(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,
    private readonly eventsService: EventsService,
    private readonly teamService: TeamService,
    private readonly registrationService: RegistrationService,
  ) {}

  async createSingleEliminationBracket(
    eventId: string,
    createScheduleDto: CreateScheduleDto,
    user: User,
  ): Promise<void> {
    const { startDate } = createScheduleDto;
    try {
      const registrations = await this.registrationService.getRegistrations(
        eventId,
        user,
      );
      if (registrations.length < 2) {
        return;
      }
      const teams = registrations.map((reg) => reg.team);
      const numberOfTeams = teams.length;
      const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numberOfTeams)));
      const numberOfByes = nextPowerOfTwo - numberOfTeams;
      const allTeams = [...teams, ...Array(numberOfByes).fill(null)];
      const schedules: Schedule[] = [];
      const numberOfRounds = Math.ceil(Math.log2(nextPowerOfTwo));

      let roundTeams = [...allTeams];

      for (let round = 0; round < numberOfRounds; round++) {
        const nextRoundTeams: (Team | null)[] = [];
        const numMatchesInRound = Math.ceil(roundTeams.length / 2);

        for (let i = 0; i < numMatchesInRound; i++) {
          const team1 = roundTeams[i * 2];
          const team2 = roundTeams[i * 2 + 1] || null;

          const schedule = new Schedule();

          schedule.team1 = team1 instanceof Team ? team1 : null;
          schedule.team2 = team2 instanceof Team ? team2 : null;
          schedule.date = this.calculateMatchDate(round, i, startDate);
          schedule.event = await this.eventsService.getEventById(eventId, user);

          schedules.push(schedule);
          if (team1) nextRoundTeams.push(team1);
          if (team2) nextRoundTeams.push(team2);
        }

        roundTeams = nextRoundTeams;
      }
      await this.scheduleRepository.save(schedules);
      this.logger.verbose(
        `Schedule created and saved successfully for event ID "${eventId}".`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create schedule for event ID "${eventId}" by user "${user.username}".`,
        error.stack,
      ); // Log error with stack trace
      throw new InternalServerErrorException();
    }
  }
  private calculateMatchDate(
    round: number,
    matchIndex: number,
    startDate: string,
  ): Date {
    const baseDate = new Date(startDate);
    baseDate.setDate(baseDate.getDate() + round * 2 + matchIndex); // Example: Schedule matches every 2 days
    return baseDate;
  }
  async updateMatchScore(
    matchId: string,
    updateMatchScoreDto: UpdateMatchScoreDto,
  ): Promise<void> {
    const { matchScore } = updateMatchScoreDto;
    try {
      const foundMatch = await this.scheduleRepository.findOne({
        where: { id: matchId },
        relations: ['team1', 'team2'],
      });

      if (!foundMatch) {
        this.logger.error(`Match with ID "${matchId}" not found.`);
        throw new NotFoundException(`Match with id: "${matchId}" not found.`);
      }

      foundMatch.score = matchScore;

      const currWinner = foundMatch.winnerId;

      const newWinner = this.checkWinner(foundMatch);

      if (currWinner !== newWinner.id) {
        foundMatch.winnerId = newWinner.id;
        this.logger.verbose(
          `Winner updated for match ID "${matchId}" to team ID "${newWinner.id}".`,
        );
      }
      await this.scheduleRepository.save(foundMatch);
      this.logger.verbose(
        `Match score updated successfully for match ID "${matchId}".`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update match score for match ID "${matchId}".`,
        error.stack,
      ); // Log error with stack trace
      throw new InternalServerErrorException();
    }
  }
  private checkWinner(match: Schedule): Team | null {
    const score = match.score;
    if (score[0] > score[1]) {
      return match.team1;
    }
    if (score[0] < score[1]) {
      return match.team2;
    } else {
      return null;
    }
  }

  getAllGamesOfEvent(eventId: string): Promise<Schedule[]> {
    return this.scheduleRepository.getAllGamesOfEvent(eventId);
  }
}
