import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  teamName: string;

  @IsArray()
  @ArrayNotEmpty()
  members: string[];
}
