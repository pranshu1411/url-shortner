import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    clientId: 'url-shortener',
    brokers: [process.env.KAFKA_BROKERS],
  });

  private readonly producer: Producer = this.kafka.producer();
  constructor() {}

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }
  async onModuleInit() {
    await this.producer.connect();
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
