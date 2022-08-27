import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  IsAlpha,
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  ValidateIf
} from 'class-validator';
import { Transform } from 'class-transformer';
import { stripUnwantedCharacters } from 'src/utils/transformers/stripUnwantedCharacters';
import { toTitleCase } from 'src/utils/transformers/toTitleCase';

import { IsISO4217 } from 'src/utils/validators/IsISO4217';

export class CreateWatchDto {
  @ApiProperty({
    description: 'Watch manufacturer',
    required: true,
    example: 'Apple',
    examples: ['Garmin', 'Casio', 'Seiko', 'Orient', 'Tissot']
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  @Transform(({ value }) =>
    stripUnwantedCharacters(value, [
      'a-z',
      'A-Z',
      '0-9',
      '-',
      '(',
      ')',
      '.',
      ' '
    ])
  )
  @Transform(({ value }) => toTitleCase(value, true))
  readonly manufacturer: string;

  @ApiProperty({
    description: 'Watch model',
    required: true,
    example: 'Watch Series 6 (GPS)',
    examples: ['Vintage A1000MGA-5EF', 'Cosmograph Daytona Oystersteel']
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  @Transform(({ value }) =>
    stripUnwantedCharacters(value, [
      'a-z',
      'A-Z',
      '0-9',
      '-',
      '+',
      '(',
      ')',
      '.',
      ' '
    ])
  )
  @Transform(({ value }) => toTitleCase(value, true))
  readonly model: string;

  @ApiProperty({
    description: 'Bracelet color of the watch',
    required: true,
    example: 'blue',
    examples: ['silver', 'chrome', 'gold']
  })
  @IsNotEmpty()
  @IsAlpha()
  @MinLength(3)
  @Transform(({ value }) => value.trim().toLowerCase())
  readonly bracelet_color: string;

  @ApiProperty({
    description:
      'Launch date of the watch, in ISO 8601 (date only) string format. Field not required.',
    required: false,
    example: '2020-09-18',
    examples: ['2020-09-18', '2019-04-30']
  })
  @ValidateIf((object, value) => {
    return value !== undefined && value !== null;
  })
  @IsDateString()
  @Transform(({ value }) => (value ? value.trim() : null))
  readonly launch_date_iso8601?: string | null;

  @ApiProperty({
    description:
      'Current price of the watch. Up to 2 decimals may be specified. Decimal separator is set to `.`',
    required: true,
    example: '399',
    examples: ['250', '200', '399.99']
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsDecimal(
    {
      force_decimal: false,
      decimal_digits: '2',
      locale: 'en-US'
    },
    {
      message:
        'price may have 2 decimal digits at most. decimal separator is set to `.`'
    }
  )
  readonly price: string;

  @ApiProperty({
    description:
      'Currency of the specified price. Must be given in ISO 4217 code as string',
    required: true,
    example: 'USD',
    examples: ['EUR', 'USD', 'RON', 'JPY']
  })
  @IsNotEmpty()
  @Length(3, 3, {
    message: 'price_currency_iso4217 must be a string of 3 characters.'
  })
  @IsISO4217()
  @Transform(({ value }) => value.trim().toUpperCase())
  readonly price_currency_iso4217: string;

  @CreateDateColumn()
  readonly created_at?: string;

  @UpdateDateColumn()
  readonly updated_at?: string;
}
