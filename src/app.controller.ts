import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LinkService } from './link/link.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private linkService: LinkService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
