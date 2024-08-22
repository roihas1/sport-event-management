import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
}
