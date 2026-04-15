import { IsString, Length, Matches } from 'class-validator';

export class PinLoginDto {
  @IsString()
  @Matches(/^[0-9]{10}$/)
  phone!: string;

  @IsString()
  @Matches(/^[0-9]{6}$/)
  @Length(6, 6)
  pin!: string;
}

