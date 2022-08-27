import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, UpdateResult, DeleteResult, Repository } from 'typeorm';

import { Watch } from 'src/watches/entities/watch.entity';
import { ExistsWatchDto } from 'src/watches/dto/exists-watch.dto';
import { CreateWatchDto } from 'src/watches/dto/create-watch.dto';
import { UpdateWatchDto } from 'src/watches/dto/update-watch.dto';
import { OffsetPagination, Pagination } from 'src/utils/types/Pagination';

@Injectable()
export class WatchesService {
  constructor(
    @InjectRepository(Watch)
    private watchRepository: Repository<Watch>
  ) {}

  async findAll(options?: Pagination): Promise<Watch[]> {
    const paginationOptions: Pagination & OffsetPagination = {
      page: options.page,
      limit: options.limit,
      offset: 0
    };
    paginationOptions.offset =
      (paginationOptions.page - 1) * paginationOptions.limit;
    return this.watchRepository.find({
      skip: paginationOptions.offset,
      take: paginationOptions.limit
    });
  }

  async findOne(id: number): Promise<Watch> {
    return this.watchRepository.findOneBy({
      id
    });
  }

  async create(createWatchDto: CreateWatchDto): Promise<InsertResult> {
    return this.watchRepository.insert(createWatchDto);
  }

  async update(
    id: number,
    updateWatchDto: UpdateWatchDto
  ): Promise<UpdateResult> {
    return this.watchRepository.update(id, updateWatchDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.watchRepository.delete(id);
  }

  async exists(existsWatchDto: ExistsWatchDto): Promise<boolean> {
    const { manufacturer, model, bracelet_color } = existsWatchDto;
    const watch = await this.watchRepository.findOneBy({
      manufacturer,
      model,
      bracelet_color
    });
    return watch !== null;
  }

  async count(): Promise<number> {
    return this.watchRepository.count();
  }
}
