import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { of } from 'rxjs';
import { KafkaServices } from '../kafka/kafka-constants';
import { KafkaTopics } from '../kafka/kafka-topics.enum';

describe('AuthService - profile', () => {
  let service: AuthService;

  const mockKafkaClient = {
    send: jest.fn(),
    subscribeToResponseOf: jest.fn(),
    connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: KafkaServices.USER_PROFILE_SERVICE,
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe devolver el perfil si Kafka responde con data válida', async () => {
    const mockPayload = { email: 'user@example.com', role: 'user' };
    const mockResponse = {
      data: { name: 'User Name', email: 'user@example.com' },
      error: null,
    };

    mockKafkaClient.send.mockReturnValue(of(mockResponse));

    const result = await service.profile(mockPayload);

    expect(result).toEqual(mockResponse.data);
    expect(mockKafkaClient.send).toHaveBeenCalledWith(
      KafkaTopics.PROFILE_USER,
      { email: 'user@example.com', role: 'user' },
    );
  });
});
