import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from './team.entity';

@Controller('team')
@UseGuards(AuthGuard(), RolesGuard)
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post()
  createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.teamService.createTeam(createTeamDto, user);
  }
  @Get('/:name')
  getTeamByName(
    @Param('name') teamName: string,
    @GetUser() user: User,
  ): Promise<Team> {
    const team = this.teamService.getTeamByName(teamName, user);
    return team;
  }
}
