import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TicketDocument = HydratedDocument<Ticket>;
@Schema()
export class Ticket {
  @Prop()
  start_value: number;

  @Prop()
  end_value: number;

  @Prop()
  current_value: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
