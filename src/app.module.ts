import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LinkModule } from './link/link.module';
import { TicketModule } from './ticket/ticket.module';
import { SeedingModule } from './seeding/seeding.module';
import { TicketSchema } from './ticket/ticket.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsModule } from './analytics/analytics.module';
import { KafkaModule } from './kafka/kafka.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        ttl: 60,
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),
    AuthModule,
    TicketModule,
    LinkModule,
    SeedingModule,
    MongooseModule.forFeature([{ name: 'Ticket', schema: TicketSchema }]),
    AnalyticsModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
