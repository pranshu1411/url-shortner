import { Module } from '@nestjs/common';
import { TicketSchema } from 'src/ticket/ticket.schema';
import { SeedingService } from './seeding.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ticket', schema: TicketSchema }]),
  ],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
