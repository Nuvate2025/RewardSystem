import { IsString, Length, Matches } from 'class-validator';

export class SetPinDto {
  @IsString()
  verificationToken!: string;

  @IsString()
  @Matches(/^[0-9]{6}$/)
  @Length(6, 6)
  pin!: string;
}

