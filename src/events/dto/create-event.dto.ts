import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString()
  eventName: string;

  @IsString()
  sportType: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsNumber()
  maxParticipants: number;

  @IsDateString()
  registrationDeadline: string;
}
