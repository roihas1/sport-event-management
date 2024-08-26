import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Role } from './user-role.enum';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController', { timestamp: true });
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    this.logger.verbose(
      `User sign-up attempt with data: ${JSON.stringify(authCredentialsDto)}`,
    );
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    this.logger.verbose(
      `User sign-in attempt with username: "${authCredentialsDto.username}"`,
    );
    return this.authService.signIn(authCredentialsDto);
  }

  @Patch('/:id/role')
  @UseGuards(AuthGuard(), RolesGuard) // Protecting the route
  @Roles('ADMIN')
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    this.logger.verbose(
      `Admin is attempting to update role for user "${id}" to "${role}"`,
    );
    return await this.authService.updateUserRole(id, role);
  }
}
