import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { seedRanges } from 'src/constants/seedRanges';
import { Ticket } from 'src/ticket/ticket.schema';

@Injectable()
export class SeedingService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async seedRanges(): Promise<void> {
    if ((await this.ticketModel.estimatedDocumentCount()) > 0) {
      return;
    }

    await this.ticketModel.insertMany(seedRanges);
  }
}
