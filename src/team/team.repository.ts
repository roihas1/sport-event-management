import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TeamRepository extends Repository<Team> {
  constructor(dataSource: DataSource) {
    super(Team, dataSource.createEntityManager());
  }
  async createTeam(createTeamDto: CreateTeamDto, user: User): Promise<void> {
    const { teamName, members } = createTeamDto;
    const team = this.create({
      teamName,
      members,
      user,
    });
    try {
      await this.save(team);
    } catch (error) {
      if (error.code == '23505') {
        throw new ConflictException('team name already exist.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  async addMember(teamName: string, member: string, user: User): Promise<void> {
    const team = await this.findOne({ where: { teamName, user } });

    if (!team) {
      throw new NotFoundException(`Team named: ${teamName} not found.`);
    }
    team.members.push(member);
    await this.save(team);
  }
  async deleteMember(
    teamName: string,
    member: string,
    user: User,
  ): Promise<void> {
    const team = await this.findOne({ where: { teamName, user } });
    if (!team) {
      throw new NotFoundException(`Team named: ${teamName} not found.`);
    }
    const memberIndex = team.members.indexOf(member);
    if (memberIndex === -1) {
      throw new NotFoundException(
        `Member named: "${member}" not found in team "${teamName}".`,
      );
    }
    team.members.splice(memberIndex, 1);
    await this.save(team);
  }
}
