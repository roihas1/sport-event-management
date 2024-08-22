// create-registration.dto.ts
import { IsString } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  teamName: string;

  @IsString()
  status: 'registered' | 'waiting';
}
