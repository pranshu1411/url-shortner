import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkSchema } from 'src/link/link.schema';
import { LinkModule } from 'src/link/link.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { AnalyticsSchema } from './analytics.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Link', schema: LinkSchema },
      { name: 'Analytics', schema: AnalyticsSchema },
    ]),
    LinkModule,
    KafkaModule,
    AuthModule,
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
