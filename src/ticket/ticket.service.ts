import { Injectable } from '@nestjs/common';
import { Ticket } from './ticket.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async createTicket(): Promise<number> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const randomRange = await this.ticketModel
        .aggregate([
          { $sample: { size: 1 } },
          { $match: { $expr: { $ne: ['$current_value', '$end_value'] } } },
        ])
        .session(session);

      console.log(randomRange);
      if (!randomRange || randomRange.length === 0) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Ranges Expired');
      }

      const updatedDocument = await this.ticketModel.findByIdAndUpdate(
        randomRange[0]._id,
        {
          $inc: { current_value: 1 },
        },
        { new: false, session },
      );

      await session.commitTransaction();
      session.endSession();

      return updatedDocument.current_value;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
