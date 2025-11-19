import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsNumber()
  expiryInDays?: number;
}
