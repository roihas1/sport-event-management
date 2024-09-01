import { beforeEach } from '@jest/globals';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { Test } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { Role } from '../auth/user-role.enum';
import { RegistrationService } from '../registration/registration.service';
import { Event } from './event.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { SportType } from './sport-types.enum';
import { eventStatus } from './event-status.enum';

const mockEventsRepository = () => ({
  getEvents: jest.fn(),
  createEvent: jest.fn(),
});
const mockRegistrationService = () => ({});
const mockUser: User = {
  id: 'user1-id',
  username: 'testUser',
  password: 'hashedPassword',
  fullName: 'John Doe',
  dateOfBirth: new Date('1990-01-01'),
  phoneNumber: '123-456-7890',
  isActive: true,
  role: Role.USER,
  events: [],
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockUser2: User = {
  id: 'user2-id',
  username: 'testUser2',
  password: 'hashedPassword',
  fullName: 'John Doe',
  dateOfBirth: new Date('1990-01-01'),
  phoneNumber: '123-456-7890',
  isActive: true,
  role: Role.USER,
  events: [],
};
const mockEvent: Event = {
  id: 'mock-event-id',
  eventName: 'Test Event',
  eventDescription: 'This is a test event description.',
  sportType: SportType.SOCCER, // Adjust if you have a specific SportType enum value
  date: '2024-09-01',
  time: '18:00:00',
  location: 'Test Stadium',
  maxParticipants: 50,
  registrationDeadline: '2024-08-30',
  status: eventStatus.ACTIVE, // Adjust if you have a specific eventStatus enum value
  createdBy: {} as User, // Provide a mock user or leave it as empty object if not used
};
describe('EventsService', () => {
  let eventsService: EventsService;
  let eventsRepository: jest.Mocked<EventsRepository>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let registrationService: jest.Mocked<RegistrationService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        RegistrationService,
        { provide: EventsRepository, useFactory: mockEventsRepository },
        { provide: RegistrationService, useFactory: mockRegistrationService },
      ],
    }).compile();

    eventsService = module.get<EventsService>(EventsService);
    eventsRepository = module.get(EventsRepository);
    registrationService = module.get(RegistrationService);
  });

  describe('getEvents', () => {
    it('call EventsRepository.getEvents and return the true result', async () => {
      const mockEventArray = [];
      eventsRepository.getEvents.mockResolvedValue(mockEventArray);
      const result = await eventsService.getEvents(mockUser);
      expect(result).toEqual([]);
    });
    it('call EventsRepository.getEvents and return the false result', async () => {
      const mockEventArray = [new Event()];
      eventsRepository.getEvents.mockResolvedValue(mockEventArray);
      const result = await eventsService.getEvents(mockUser);
      expect(result).toEqual(mockEventArray);
    });
    it('should call the repository method with the correct user', async () => {
      await eventsService.getEvents(mockUser);
      expect(eventsRepository.getEvents).toHaveBeenCalledWith(mockUser); // Verify the method was called with the correct argument
    });
  });
  describe('createEvent', () => {
    let mockUser: User;
    let mockCreateEventDto: CreateEventDto;

    beforeEach(() => {
      mockUser = {
        id: 'user2-id',
        username: 'testUser2',
        password: 'hashedPassword',
        fullName: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '123-456-7890',
        isActive: true,
        role: Role.USER,
        events: [],
      } as User; // Example mock user
      mockCreateEventDto = {
        eventName: 'Test Event',
        description: 'Test Description',
        sportType: SportType.HOCKEY,
        date: '2024-09-01',
        time: '18:00',
        location: 'Stadium',
        maxParticipants: 100,
        registrationDeadline: '2024-08-30',
      } as CreateEventDto;
    });

    it('should call eventsRepository.createEvent with the correct parameters', async () => {
      eventsRepository.createEvent.mockResolvedValue(mockEvent);

      const result = await eventsService.createEvent(
        mockCreateEventDto,
        mockUser,
      );

      expect(eventsRepository.createEvent).toHaveBeenCalledWith(
        mockCreateEventDto,
        mockUser,
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw an error if the repository throws an error', async () => {
      eventsRepository.createEvent.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(
        eventsService.createEvent(mockCreateEventDto, mockUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
