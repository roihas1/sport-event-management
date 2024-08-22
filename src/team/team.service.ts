import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamRepository } from './team.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { User } from 'src/auth/user.entity';
import { Team } from './team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamRepository)
    private teamRepository: TeamRepository,
  ) {}
  createTeam(createTeamDto: CreateTeamDto, user: User): Promise<void> {
    return this.teamRepository.createTeam(createTeamDto, user);
  }
  async getTeamByName(teamName: string, user: User): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { teamName, user },
    });
    if (!team) {
      throw new NotFoundException(
        `team with the name: "${teamName}" not found`,
      );
    }
    return team;
  }
}
