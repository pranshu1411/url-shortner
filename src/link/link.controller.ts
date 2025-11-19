import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { UserDocument } from 'src/auth/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateLinkDto } from './dto/create-link-dto';
import { LinkDocument } from './link.schema';
import { Request } from 'express';

@Controller('links')
@UseGuards(AuthGuard())
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Get()
  getUserLinks(
    @GetUser() user: UserDocument,
    @Headers('host') host: string,
    @Req() req: Request,
  ): Promise<LinkDocument[]> {
    const baseUrl = req.protocol + '://' + host;
    return this.linkService.getUserLinks(user, baseUrl);
  }

  @Post()
  createLink(
    @GetUser() user: UserDocument,
    @Body() createLinkDto: CreateLinkDto,
    @Headers('host') host: string,
    @Req() req: Request,
  ): Promise<{ shortUrl: string }> {
    const baseUrl = req.protocol + '://' + host;
    return this.linkService.createLink(user, createLinkDto, baseUrl);
  }
}
