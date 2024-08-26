import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from './team.entity';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('team')
@UseGuards(AuthGuard(), RolesGuard)
export class TeamController {
  private logger = new Logger('TeamController', { timestamp: true });
  constructor(private teamService: TeamService) {}

  @Post()
  createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" creating team with name: "${createTeamDto.teamName}"`,
    );
    return this.teamService.createTeam(createTeamDto, user);
  }
  @Get('/:name')
  getTeamByName(
    @Param('name') teamName: string,
    @GetUser() user: User,
  ): Promise<Team> {
    this.logger.verbose(
      `User "${user.username}" retrieving team with name: "${teamName}"`,
    );
    const team = this.teamService.getTeamByName(teamName, user);
    return team;
  }
  @Put('/:teamName/add')
  addNewMemberToTeam(
    @Param('teamName') teamName: string,
    @Body() addMemberDto: AddMemberDto,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" adding member "${addMemberDto.memberName}" to team "${teamName}"`,
    );
    const { memberName } = addMemberDto;
    return this.teamService.addNewMemberToTeam(teamName, memberName, user);
  }
  @Delete('/:teamName/deleteMember')
  deleteMemberFromTeam(
    @Param('teamName') teamName: string,
    @Body() addMemberDto: AddMemberDto,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(
      `User "${user.username}" deleting member "${addMemberDto.memberName}" from team "${teamName}"`,
    );
    const { memberName } = addMemberDto;
    return this.teamService.deleteMemberFromTeam(teamName, memberName, user);
  }
  @Delete('/:teamName/delete')
  deleteTeam(
    @Param('teamName') teamName: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(`User "${user.username}" deleting team "${teamName}"`);
    return this.teamService.deleteTeam(teamName, user);
  }
}
