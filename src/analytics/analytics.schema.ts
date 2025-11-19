// analytics schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnalyticsDocument = HydratedDocument<Analytics>;

@Schema()
export class Analytics {
  @Prop({ required: true, type: String, index: true })
  shortCode: string;

  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true, type: String })
  browser: string;

  @Prop({ required: true, type: String })
  deviceType: string;

  @Prop({ required: true, type: String })
  referer: string;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
