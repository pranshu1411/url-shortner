import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Link, LinkDocument } from './link.schema';
import { UserDocument } from 'src/auth/user.schema';
import { CreateLinkDto } from './dto/create-link-dto';
import { TicketService } from 'src/ticket/ticket.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { encodeMapping } from 'src/constants/encodeMapping';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link.name) private linkModel: Model<Link>,
    private ticketService: TicketService,
  ) {}

  async getLink(shortCode: string): Promise<string> {
    const link = await this.linkModel.findOne({ short_code: shortCode });
    if (!link) {
      throw new HttpException('Link not found', HttpStatus.NOT_FOUND);
    }
    return link.url;
  }

  async getUserLinks(
    user: UserDocument,
    baseUrl: string,
  ): Promise<LinkDocument[]> {
    let result: LinkDocument[] = [];
    if (isValidObjectId(user._id)) {
      result = await this.linkModel.find(
        {
          user_id: user._id,
        },
        'url short_code',
      );
    }

    result = result.map((link) => {
      link.short_code = `${baseUrl}/${link.short_code}`;
      return link;
    });

    return result;
  }

  async getOwner(shortCode: string): Promise<string> {
    const link = await this.linkModel.findOne({
      short_code: shortCode,
    });

    return link.user_id;
  }

  //check if its a valid url
  isValidUrl = (urlString: string) => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
  };

  async createLink(
    user: UserDocument,
    createLinkDto: CreateLinkDto,
    host: string,
  ): Promise<{ shortUrl: string }> {
    const { url, expiryInDays } = createLinkDto;

    if (!this.isValidUrl(url)) {
      throw new HttpException('Invalid url', HttpStatus.BAD_REQUEST);
    }
    try {
      console.log('creating token');
      const value = await this.ticketService.createTicket();

      //encode the value
      const short_code = this.encode(value);
      const params: any = { user_id: user._id, url, short_code };
      if (expiryInDays && expiryInDays > 0) {
        params.expiry_date = new Date();
        params.expiry_date.setDate(params.expiry_date.getDate() + expiryInDays);
      }
      await this.linkModel.create(params);
      return { shortUrl: host + '/' + short_code };
    } catch (error) {
      throw error;
    }
  }

  encode(decimal: number) {
    let short_url = '';
    while (decimal > 0) {
      const pair = decimal & 63;

      if (decimal) {
        short_url += encodeMapping[pair];
      }
      decimal >>>= 6;
    }
    return short_url;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async expireLink() {
    try {
      //delete
      await this.linkModel.deleteMany({
        expiry_date: {
          $lt: new Date(),
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
