import {Kafka} from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'logsentinel',
  brokers: ['localhost:9092']
});

export const LOG_TOPIC = 'app-logs';
