import { PartialType } from '@nestjs/mapped-types';
import { CreateWatchDto } from './create-watch.dto';

export class ExistsWatchDto extends PartialType(CreateWatchDto) {}
