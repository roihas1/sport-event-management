import { IsEnum } from 'class-validator';
import { eventStatus } from '../event-status.enum';

export class UpdateEventStatusDto {
  @IsEnum(eventStatus)
  status: eventStatus;
}
