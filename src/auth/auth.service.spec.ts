// import { Test, TestingModule } from '@nestjs/testing';

// import { UsersRepository } from '../auth/users.repository';
// import { JwtService } from '@nestjs/jwt';
// import { NotFoundException, UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';
// import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
// import { LoginDto } from '../auth/dto/login.dto';
// import { Role } from './user-role.enum';
// import { User } from './user.entity';
// import { AuthService } from './auth.service';

// const mockUsersRepository = () => ({
//   createUser: jest.fn(),
//   findOne: jest.fn(),
//   save: jest.fn(),
//   updateUserRole: jest.fn(),
// });

// const mockJwtService = () => ({
//   sign: jest.fn(),
// });

// describe('AuthService', () => {
//   let authService: AuthService;
//   let usersRepository;
//   let jwtService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         { provide: UsersRepository, useFactory: mockUsersRepository },
//         { provide: JwtService, useFactory: mockJwtService },
//       ],
//     }).compile();

//     authService = module.get<AuthService>(AuthService);
//     usersRepository = module.get<UsersRepository>(UsersRepository);
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   describe('signUp', () => {
//     it('should sign up a user successfully', async () => {
//       usersRepository.createUser.mockResolvedValue(undefined);
//       const authCredentialsDto: AuthCredentialsDto = {
//         username: 'testuser',
//         password: 'Testpass123!',
//         fullName: 'John Doe',
//         dateOfBirth: '1990-01-01',
//         phoneNumber: '1234567890',
//         role: Role.USER, // optional field
//       };

//       await expect(
//         authService.signUp(authCredentialsDto),
//       ).resolves.not.toThrow();
//       expect(usersRepository.createUser).toHaveBeenCalledWith(
//         authCredentialsDto,
//       );
//     });

//     it('should throw an error if sign-up fails', async () => {
//       usersRepository.createUser.mockRejectedValue(new Error('Sign up failed'));

//       const authCredentialsDto: AuthCredentialsDto = {
//         username: 'testuser',
//         password: 'Testpass123!',
//         fullName: 'John Doe',
//         dateOfBirth: '1990-01-01',
//         phoneNumber: '1234567890',
//         role: Role.USER, // optional field
//       };

//       await expect(authService.signUp(authCredentialsDto)).rejects.toThrow(
//         'Sign up failed',
//       );
//     });
//   });

//   describe('signIn', () => {
//     it('should return access token on successful sign-in', async () => {
//       const loginDto: LoginDto = {
//         username: 'testuser',
//         password: 'Testpass123!',
//       };
//       const user = {
//         username: 'testuser',
//         password: await bcrypt.hash('Testpass123!', 10),
//         isActive: false,
//         fullName: 'John Doe',
//         dateOfBirth: '1990-01-01',
//         phoneNumber: '1234567890',
//       };
//       usersRepository.findOne.mockResolvedValue(user);
//       jwtService.sign.mockReturnValue('accessToken');

//       const result = await authService.signIn(loginDto);

//       expect(result).toEqual({ accessToken: 'accessToken' });
//       expect(usersRepository.save).toHaveBeenCalledWith({
//         ...user,
//         isActive: true,
//       });
//     });

//     it('should throw UnauthorizedException if password is incorrect', async () => {
//       const loginDto: LoginDto = {
//         username: 'testuser',
//         password: 'wrongpass',
//       };
//       const user = {
//         username: 'testuser',
//         password: await bcrypt.hash('Testpass123!', 10),
//       };
//       usersRepository.findOne.mockResolvedValue(user);

//       await expect(authService.signIn(loginDto)).rejects.toThrow(
//         UnauthorizedException,
//       );
//     });

//     it('should throw UnauthorizedException if user not found', async () => {
//       usersRepository.findOne.mockResolvedValue(null);
//       const loginDto: LoginDto = {
//         username: 'testuser',
//         password: 'Testpass123!',
//       };

//       await expect(authService.signIn(loginDto)).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('updateUserRole', () => {
//     it('should update user role successfully', async () => {
//       usersRepository.updateUserRole.mockResolvedValue({ affected: 1 });

//       await expect(
//         authService.updateUserRole('user-id', Role.ADMIN),
//       ).resolves.not.toThrow();
//       expect(usersRepository.updateUserRole).toHaveBeenCalledWith(
//         'user-id',
//         Role.ADMIN,
//       );
//     });

//     it('should throw NotFoundException if user not found', async () => {
//       usersRepository.updateUserRole.mockResolvedValue({ affected: 0 });

//       await expect(
//         authService.updateUserRole('user-id', Role.ADMIN),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('logout', () => {
//     it('should log out user successfully', async () => {
//       const user: User = { username: 'testuser', isActive: true } as User;
//       usersRepository.findOne.mockResolvedValue(user);

//       await expect(authService.logout(user)).resolves.not.toThrow();
//       expect(usersRepository.save).toHaveBeenCalledWith({
//         ...user,
//         isActive: false,
//       });
//     });

//     it('should throw NotFoundException if user is not found during logout', async () => {
//       usersRepository.findOne.mockResolvedValue(null);
//       const user: User = {
//         username: 'nonexistentuser',
//         isActive: true,
//       } as User;

//       await expect(authService.logout(user)).rejects.toThrow(NotFoundException);
//     });
//   });
// });
