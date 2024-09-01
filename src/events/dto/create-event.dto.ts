import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { SportType } from '../sport-types.enum';

export class CreateEventDto {
  @IsString()
  eventName: string;

  @IsString()
  description: string;

  @IsEnum(SportType)
  sportType: SportType;

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
