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
import { LoginDto } from './dto/login.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController', { timestamp: true });
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    this.logger.verbose(
      `User sign-up attempt with username: ${authCredentialsDto.username}`,
    );
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: LoginDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    this.logger.verbose(
      `User sign-in attempt with username: "${authCredentialsDto.username}"`,
    );
    return this.authService.signIn(authCredentialsDto);
  }
  @Patch('/logout')
  @UseGuards(AuthGuard(), RolesGuard)
  logout(@GetUser() user: User): Promise<void> {
    this.logger.verbose(
      `User loging out attempt with username: "${user.username}".`,
    );
    return this.authService.logout(user);
  }
  @Patch('/:id/role')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('ADMIN')
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    this.logger.verbose(
      `Admin is attempting to update role for user "${id}" to "${role}"`,
    );
    return await this.authService.updateUserRole(id, role);
  }
}
