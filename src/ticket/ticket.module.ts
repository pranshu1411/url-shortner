import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketSchema } from './ticket.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ticket', schema: TicketSchema }]),
  ],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
