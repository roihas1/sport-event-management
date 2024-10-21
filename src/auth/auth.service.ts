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
import { LoginDto } from './dto/login.dto';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
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
    authCredentialsDto: LoginDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { username, password } = authCredentialsDto;

    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) {
      this.logger.error(`User "${username}" not found.`);
      throw new NotFoundException(`User "${username}" not found.`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Sign-in failed for user "${username}" due to incorrect credentials.`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    user.isActive = true;
    await this.usersRepository.save(user);

    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);

    const expiresIn = this.configService.get<number>('EXPIRE_IN') || 360;
    console.log(expiresIn);

    this.logger.verbose(
      `User "${username}" signed in successfully and access token generated.`,
    );

    return { accessToken, expiresIn };
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
  async logout(user: User): Promise<void> {
    try {
      const found = await this.usersRepository.findOne({
        where: { username: user.username },
      });
      found.isActive = false;
      await this.usersRepository.save(found);
      this.logger.verbose(`User "${user.username}" logout.`);
    } catch (error) {
      throw new NotFoundException(`User ${user.username} not found.`);
    }
  }
}
