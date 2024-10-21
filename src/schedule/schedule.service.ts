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

  // Create a single-elimination bracket for an event
  async createSingleEliminationBracket(
    eventId: string,
    createScheduleDto: CreateScheduleDto,
    user: User,
  ): Promise<void> {
    const { startDate, startTime } = createScheduleDto; // Starting date for the first round
    console.log(startTime);
    try {
      const registrations = await this.registrationService.getRegistrations(
        eventId,
        user,
      );
      if (registrations.length < 2) {
        this.logger.error(
          `Insufficient teams registered for event ID "${eventId}".`,
        );
        throw new Error(
          `Insufficient teams registered for event ID "${eventId}".`,
        );
      }

      const teams = registrations.map((reg) => reg.team);
      const numberOfTeams = teams.length;
      const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numberOfTeams)));
      const numberOfByes = nextPowerOfTwo - numberOfTeams;
      const allTeams = [...teams, ...Array(numberOfByes).fill(null)];
      const schedules: Schedule[] = [];
      const numberOfRounds = Math.ceil(Math.log2(nextPowerOfTwo));

      let roundTeams = [...allTeams];
      const currentDate = new Date(startDate);
      let numMatchesInRound = roundTeams.length;
      let matchesNumber = roundTeams.length - 1;
      for (let round = 0; round < numberOfRounds; round++) {
        const nextRoundTeams: (Team | null)[] = [];
        numMatchesInRound = numMatchesInRound / 2;
        for (let i = 0; i < numMatchesInRound; i++) {
          const team1 = roundTeams[i * 2];
          const team2 = roundTeams[i * 2 + 1] || null;

          const schedule = new Schedule();

          if (round === 0) {
            schedule.team1 = team1 instanceof Team ? team1 : null;
            schedule.team2 = team2 instanceof Team ? team2 : null;
          } else {
            schedule.team1 = null;
            schedule.team2 = null;
          }

          schedule.date = this.calculateMatchTime(
            currentDate,
            startTime,
            i * 15,
          );
          schedule.event = await this.eventsService.getEventById(eventId, user);
          schedule.round = round + 1;
          schedule.maxRounds = numberOfRounds;

          schedule.matchNumber = matchesNumber;
          matchesNumber--;
          schedules.push(schedule);

          // For next rounds, push nulls as placeholders
          if (round === 0) {
            nextRoundTeams.push(null); // Placeholder for winners of this round
          }
        }

        // Only add non-null teams to the next round
        roundTeams = nextRoundTeams.filter((team) => team !== null);
        currentDate.setDate(currentDate.getDate() + 3); // Set the next round date
      }

      await this.scheduleRepository.save(schedules);
      this.logger.verbose(
        `Schedule created and saved successfully for event ID "${eventId}".`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create schedule for event ID "${eventId}" by user "${user.username}".`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
  private calculateMatchTime(
    currentDate: Date,
    startTime: string,
    additionalMintutes: number,
  ): Date {
    const matchTime = new Date(currentDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = minutes + additionalMintutes;
    const mins = totalMinutes % 60;
    const hoursToAdd = Math.floor(totalMinutes / 60);
    matchTime.setHours(hours + hoursToAdd);

    matchTime.setMinutes(mins);
    return matchTime;
  }

  // Update match score and propagate the winner to the next round
  async updateMatchScore(
    matchId: string,
    updateMatchScoreDto: UpdateMatchScoreDto,
  ): Promise<number[]> {
    const { matchScore } = updateMatchScoreDto;

    try {
      const foundMatch = await this.scheduleRepository.findOne({
        where: { id: matchId },
        relations: ['team1', 'team2', 'event'],
      });

      if (!foundMatch) {
        this.logger.error(`Match with ID "${matchId}" not found.`);
        throw new NotFoundException(`Match with id: "${matchId}" not found.`);
      }

      // Update the match score
      foundMatch.score = matchScore;

      // Determine the winner
      const newWinner = this.checkWinner(foundMatch);

      // If the winner has changed or a winner is now determined
      if (foundMatch.winnerId !== (newWinner ? newWinner.id : null)) {
        foundMatch.winnerId = newWinner ? newWinner.id : null;
        this.logger.verbose(
          `Winner updated for match ID "${matchId}" to team ID "${newWinner?.id || 'null'}.`,
        );
        if (foundMatch.maxRounds != foundMatch.round) {
          await this.propagateWinnerToNextRound(foundMatch, newWinner);
        }
      }

      // Save the updated match
      await this.scheduleRepository.save(foundMatch);
      this.logger.verbose(
        `Match score updated successfully for match ID "${matchId}".`,
      );
      return foundMatch.score;
    } catch (error) {
      this.logger.error(
        `Failed to update match score for match ID "${matchId}".`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  // Function to propagate the winner to the next round and schedule the match
  private async propagateWinnerToNextRound(
    match: Schedule,
    winner: Team | null,
  ): Promise<void> {
    if (!winner) {
      return;
    }

    const nextRound = match.round + 1;
    const eventId = match.event.id;

    const positionInCurrentRound = match.matchNumber;
    const targetMatchNumber = Math.floor(positionInCurrentRound / 2);

    // Find the next match where this winner should go in the next round
    console.log(targetMatchNumber);
    let nextMatch = await this.scheduleRepository.findOne({
      where: [
        {
          round: nextRound,
          event: { id: eventId },
          matchNumber: targetMatchNumber,
        },
      ],
      relations: ['team1', 'team2'],
    });

    if (!nextMatch) {
      // If no next match is found, create a new match for the next round
      console.log(targetMatchNumber);
      console.log(positionInCurrentRound);
      nextMatch = new Schedule();
      nextMatch.event = match.event;
      nextMatch.round = nextRound;
      nextMatch.date = this.calculateNextRoundDate(match.date); // Assign date for the next match
      await this.scheduleRepository.save(nextMatch);
    }
    // Check if the current winner is already in the next match
    if (nextMatch.team1 && nextMatch.team1.id === winner.id) {
      this.logger.verbose(
        `Winner team ID "${winner.id}" is already in the next match ID "${nextMatch.id}" as team1.`,
      );
      return;
    } else if (nextMatch.team2 && nextMatch.team2.id === winner.id) {
      this.logger.verbose(
        `Winner team ID "${winner.id}" is already in the next match ID "${nextMatch.id}" as team2.`,
      );
      return;
    }

    if (
      nextMatch.team1 &&
      (nextMatch.team1.id == match.team1.id ||
        nextMatch.team1.id == match.team2.id)
    ) {
      nextMatch.team1 = winner;
      this.logger.verbose(
        `Replaced team1 with winner team ID "${winner.id}" in the next match ID "${nextMatch.id}".`,
      );
    } else if (
      nextMatch.team2 &&
      (nextMatch.team2.id == match.team1.id ||
        nextMatch.team2.id == match.team2.id)
    ) {
      nextMatch.team2 = winner;
      this.logger.verbose(
        `Replaced team2 with winner team ID "${winner.id}" in the next match ID "${nextMatch.id}".`,
      );
    } else {
      if (!nextMatch.team1) {
        nextMatch.team1 = winner;
      } else if (!nextMatch.team2) {
        nextMatch.team2 = winner;
      }
    }

    await this.scheduleRepository.save(nextMatch);
    this.logger.verbose(
      `Winner team ID "${winner.id}" propagated to the next match ID "${nextMatch.id}".`,
    );
  }

  // Function to calculate the date for the next round's match
  private calculateNextRoundDate(previousMatchDate: Date): Date {
    const nextRoundDate = new Date(previousMatchDate);
    nextRoundDate.setDate(nextRoundDate.getDate() + 3); // Assuming each round is 3 days apart
    return nextRoundDate;
  }

  // Function to determine the winner of the match
  private checkWinner(match: Schedule): Team | null {
    const score = match.score;
    if (score[0] > score[1]) {
      return match.team1;
    }
    if (score[0] < score[1]) {
      return match.team2;
    }
    return null; // Handle ties or no winner determined
  }

  getAllGamesOfEvent(eventId: string): Promise<Schedule[]> {
    return this.scheduleRepository.getAllGamesOfEvent(eventId);
  }

  deleteAllEventGames(eventId: string): Promise<void> {
    return this.scheduleRepository.deleteAllEventGames(eventId);
  }
  async getMatch(matchId: string): Promise<Schedule> {
    try {
      const foundMatch = await this.scheduleRepository.findOne({
        where: { id: matchId },
        relations: ['team1', 'team2'],
      });

      if (!foundMatch) {
        this.logger.error(`Match with ID "${matchId}" not found.`);
        throw new NotFoundException(`Match with id: "${matchId}" not found.`);
      }
      return foundMatch;
    } catch (error) {
      this.logger.error(
        `Failed to update match score for match ID "${matchId}".`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
