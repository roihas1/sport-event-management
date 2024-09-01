import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamRepository } from './team.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { User } from '../auth/user.entity';
import { Team } from './team.entity';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class TeamService {
  private logger = new Logger('TeamService', { timestamp: true });
  constructor(
    @InjectRepository(TeamRepository)
    private teamRepository: TeamRepository,
  ) {}
  async createTeam(createTeamDto: CreateTeamDto, user: User): Promise<void> {
    try {
      await this.teamRepository.createTeam(createTeamDto, user);
      this.logger.verbose(
        `Team "${createTeamDto.teamName}" created successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create team with name: "${createTeamDto.teamName}" for user: "${user.username}".`,
        error.stack,
      );
      throw error; // Re-throw to ensure proper error handling
    }
  }
  async getTeamByName(teamName: string, user: User): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({
        where: { teamName, user },
      });
      if (!team) {
        this.logger.warn(
          `Team with name: "${teamName}" not found for user: "${user.username}".`,
        );
        throw new NotFoundException(
          `Team with the name: "${teamName}" not found`,
        );
      }
      this.logger.verbose(
        `Team with name: "${teamName}" found for user: "${user.username}".`,
      );
      return team;
    } catch (error) {
      this.logger.error(
        `Failed to fetch team with name: "${teamName}" for user: "${user.username}".`,
        error.stack,
      );
      throw error;
    }
  }

  async addNewMemberToTeam(
    teamName: string,
    member: string,
    user: User,
  ): Promise<void> {
    try {
      await this.teamRepository.addMember(teamName, member, user);
      this.logger.verbose(
        `Member: "${member}" added to team: "${teamName}" successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add member: "${member}" to team: "${teamName}" for user: "${user.username}".`,
        error.stack,
      );
      throw error; // Re-throw to ensure proper error handling
    }
  }
  async deleteMemberFromTeam(
    teamName: string,
    member: string,
    user: User,
  ): Promise<void> {
    try {
      await this.teamRepository.deleteMember(teamName, member, user);
      this.logger.verbose(
        `Member: "${member}" deleted from team: "${teamName}" successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete member: "${member}" from team: "${teamName}" for user: "${user.username}".`,
        error.stack,
      );
      throw error;
    }
  }
  async getUserAllTeams(user: User): Promise<Team[]> {
    return await this.teamRepository.getUserAllTeams(user);
  }
  async deleteTeam(teamName: string, user: User): Promise<void> {
    try {
      await this.teamRepository.delete({ teamName, user });
      this.logger.verbose(
        `Team with name: "${teamName}" deleted successfully.`,
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('violates foreign key constraint')
      ) {
        this.logger.warn(
          `Cannot delete team with name: "${teamName}" due to foreign key constraint. User: "${user.username}".`,
        );
        throw new BadRequestException(
          'Cannot delete team because it is being referenced in another table (registration). First delete registration.',
        );
      }
      this.logger.error(
        `Failed to delete team with name: "${teamName}" for user: "${user.username}".`,
        error.stack,
      );
      throw error; // Re-throw to ensure proper error handling
    }
  }
}
