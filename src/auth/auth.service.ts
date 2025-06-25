import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { KafkaServices } from 'src/kafka/kafka-constants';
import { KafkaTopics } from 'src/kafka/kafka-topics.enum';

@Injectable()
export class AuthService {
  private readonly TIMEOUT = 5000;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(KafkaServices.USER_PROFILE_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('📡 Suscribiendo a respuesta del topic PROFILE_USER');
    this.kafkaClient.subscribeToResponseOf(KafkaTopics.PROFILE_USER);
    await this.kafkaClient.connect();
    this.logger.log('✅ Kafka conectado');
  }

  async profile({ email, role }: { email: string; role: string }) {
    this.logger.log(`📥 profile() recibido con email=${email}, role=${role}`);

    const payload = {
      email: email.trim(),
      role: role.trim(),
    };

    this.logger.debug(
      `📤 Enviando payload a Kafka: ${JSON.stringify(payload)}`,
    );

    try {
      const { data, error } = await firstValueFrom(
        this.kafkaClient
          .send<{
            data?: { name: string; email: string };
            error?: string;
          }>(KafkaTopics.PROFILE_USER, payload)
          .pipe(timeout(this.TIMEOUT)),
      );

      this.logger.debug(
        `📨 Respuesta de Kafka: data=${JSON.stringify(data)}, error=${error}`,
      );

      if (!data) {
        this.logger.error(`⚠️ Kafka devolvió error: ${error}`);
        throw new ServiceUnavailableException(error || 'Sin data received');
      }

      this.logger.log(
        `✅ Perfil recibido correctamente: ${JSON.stringify(data)}`,
      );
      return data;
    } catch (err) {
      if (err instanceof TimeoutError) {
        this.logger.error('⏱ Timeout al esperar respuesta de Kafka');
        throw new ServiceUnavailableException('Request timed out');
      }

      this.logger.error(`❌ Error inesperado: ${err.message}`);
      throw new ServiceUnavailableException('Service Unavailable');
    }
  }
}
