import { IsDateString, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  startDate: string;

  @IsString()
  startTime: string;
}
