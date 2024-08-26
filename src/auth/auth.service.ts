import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { Role } from './user-role.enum';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    try {
      await this.usersRepository.createUser(authCredentialsDto);
      this.logger.verbose(
        `User "${authCredentialsDto.username}" signed up successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sign up user "${authCredentialsDto.username}".`,
        error.stack,
      );
      throw error;
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload);
      this.logger.verbose(
        `User "${username}" signed in successfully and access token generated.`,
      );
      return { accessToken };
    } else {
      this.logger.warn(
        `Sign-in failed for user "${username}" due to incorrect credentials.`,
      );
      throw new UnauthorizedException('Please check your credentials');
    }
  }
  async updateUserRole(id: string, role: Role): Promise<void> {
    try {
      const result = await this.usersRepository.updateUserRole(id, role);
      if (result.affected === 0) {
        this.logger.warn(
          `Failed to update role for user with ID: "${id}". User not found.`,
        );
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.logger.verbose(
        `User with ID: "${id}" role updated to "${role}" successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error occurred while updating role for user with ID: "${id}" to "${role}".`,
        error.stack,
      );
      throw error;
    }
  }
}
