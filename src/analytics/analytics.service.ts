import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProducerRecord } from 'kafkajs';
import { Model } from 'mongoose';
import { ConsumerService } from 'src/kafka/consumer.service';
import { ProducerService } from 'src/kafka/producer.service';
import { Analytics } from './analytics.schema';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  constructor(
    private readonly producerService: ProducerService,
    private readonly consumerService: ConsumerService,
    @InjectModel('Analytics') private readonly analyticsModel: Model<Analytics>,
  ) {}

  async sendAnalytics(shortCode: string, req: Request) {
    const record: ProducerRecord = {
      topic: 'analytics',
      messages: [
        {
          value: JSON.stringify({ headers: req.headers, shortCode }),
        },
      ],
    };
    await this.producerService.produce(record);
  }

  async getAnalytics(shortCode: string) {
    /// to implement
    const clicksByBrowser = await this.browserTop5(shortCode);
    const clicksByDevice = await this.deviceTypeTop5(shortCode);
    const timeAnalytics = await this.timeAnalytics(shortCode);

    const refererTop5 = await this.refererTop5(shortCode);

    return {
      clicksByDevice,
      clicksByBrowser,
      timeAnalytics,
      refererTop5,
    };
  }

  async refererTop5(shortCode: string) {
    try {
      const analytics = await this.analyticsModel
        .aggregate([
          { $match: { shortCode } },
          {
            $group: {
              _id: '$referer',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .exec();
      return analytics;
    } catch (error) {
      console.error('Failed to get referrer top 5:', error);
      throw error;
    }
  }

  async browserTop5(shortCode: string) {
    try {
      const analytics = await this.analyticsModel
        .aggregate([
          { $match: { shortCode } },
          {
            $group: {
              _id: '$browser',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .exec();
      return analytics;
    } catch (error) {
      console.error('Failed to get browser top 5:', error);
      throw error;
    }
  }

  async deviceTypeTop5(shortCode: string) {
    try {
      const analytics = await this.analyticsModel
        .aggregate([
          { $match: { shortCode } },
          {
            $group: {
              _id: '$deviceType',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .exec();
      return analytics;
    } catch (error) {
      console.error('Failed to get device type top 5:', error);
      throw error;
    }
  }

  async timeAnalytics(shortCode: string) {
    try {
      const analytics = await this.analyticsModel
        .aggregate([
          {
            $match: {
              shortCode,
            },
          },
          {
            $project: {
              timestamp: 1,
            },
          },
          {
            $facet: {
              totalClicks: [
                {
                  $count: 'count',
                },
              ],
              mostActiveHours: [
                {
                  $group: {
                    _id: {
                      hour: {
                        $hour: {
                          date: '$timestamp',
                          timezone: '+0530',
                        },
                      },
                    },
                    count: {
                      $sum: 1,
                    },
                  },
                },
                {
                  $sort: {
                    count: -1,
                  },
                },
                {
                  $limit: 5,
                },
                {
                  $project: {
                    _id: 0,
                    hour: '$_id.hour',
                    count: 1,
                  },
                },
              ],
              mostActiveWeekday: [
                {
                  $group: {
                    _id: {
                      $dayOfWeek: '$timestamp',
                    },
                    count: {
                      $sum: 1,
                    },
                  },
                },
                {
                  $sort: {
                    count: -1,
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    dayOfWeek: '$_id',
                    count: 1,
                  },
                },
              ],
              mostActiveMonth: [
                {
                  $group: {
                    _id: {
                      $month: '$timestamp',
                    },
                    count: {
                      $sum: 1,
                    },
                  },
                },
                {
                  $sort: {
                    count: -1,
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    month: '$_id',
                    count: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              shortCode: 1,
              analytics: {
                totalClicks: {
                  $arrayElemAt: ['$totalClicks.count', 0],
                },
                mostActiveHours: '$mostActiveHours',
                mostActiveWeekday: {
                  $arrayElemAt: ['$mostActiveWeekday', 0],
                },
                mostActiveMonth: {
                  $arrayElemAt: ['$mostActiveMonth', 0],
                },
              },
            },
          },
        ])
        .exec();
      return analytics;
    } catch (error) {
      console.error('Failed to get time analytics:', error);
      throw error;
    }
  }

  async onModuleInit() {
    await this.consumerService.consume(
      { topics: ['analytics'] },
      {
        eachMessage: async ({ message, heartbeat }) => {
          const data = JSON.parse(message.value.toString());
          const timestamp = new Date();
          const userAgent = data.headers['user-agent'];
          const browser = userAgent.split('/')[0];
          const isMobile = /Mobile/i.test(userAgent);
          const deviceType = isMobile ? 'Mobile' : 'Desktop';
          const referer = data.headers['referer'] || 'direct';

          console.log({
            shortCode: data.shortCode,
            timestamp,
            browser,
            deviceType,
            referer,
          });
          await this.analyticsModel.create({
            shortCode: data.shortCode,
            timestamp,
            browser,
            deviceType,
            referer,
          });
          await heartbeat();
        },
      },
    );
  }
}
