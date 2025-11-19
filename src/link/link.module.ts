import { Module } from '@nestjs/common';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { AuthModule } from 'src/auth/auth.module';
import { LinkSchema } from './link.schema';
import { TicketModule } from 'src/ticket/ticket.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Link', schema: LinkSchema }]),
    AuthModule,
    TicketModule,
  ],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
