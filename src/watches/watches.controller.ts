import {
  ParseIntPipe,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  HttpException
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WatchesService } from 'src/watches/watches.service';
import { CreateWatchDto } from 'src/watches/dto/create-watch.dto';
import { ExistsWatchDto } from 'src/watches/dto/exists-watch.dto';
import { UpdateWatchDto } from 'src/watches/dto/update-watch.dto';

import { RouteLoggingService } from 'src/utils/logging/RouteLoggingService';
import { Pagination } from 'src/utils/types/Pagination';

@ApiTags('watches')
@Controller('watches')
export class WatchesController {
  constructor(
    private readonly routeLoggingService: RouteLoggingService,
    private readonly watchesService: WatchesService
  ) {}

  @ApiOperation({ summary: 'Add a new watch' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests.'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Watch already exists.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Watch added succesfully.'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Query or server error.'
  })
  @Post()
  async create(@Body() createWatchDto: CreateWatchDto) {
    const exists = await this.watchesService.exists(
      createWatchDto as ExistsWatchDto
    );
    if (exists) {
      throw new HttpException(
        "The watch you're trying to find already exists, please try again.",
        HttpStatus.CONFLICT
      );
    }
    try {
      await this.watchesService.create(createWatchDto);
      return {
        message: 'A new watch has been added succesfully.'
      };
    } catch (err) {
      this.routeLoggingService.setCustomMessage('create() route handling');
      this.routeLoggingService.setPayload(createWatchDto);
      this.routeLoggingService.setErrorStack(err.stack);
      this.routeLoggingService.setErrorMessage(err.message);
      this.routeLoggingService.log();
      throw new HttpException(
        'Something went wrong on our side while trying to create the resource.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: 'Get all watches' })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'page number. Default = 1 | Optional',
    required: false
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'limit. Default = 25 | Optional',
    required: false
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Watches have been fetched succesfully.'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Query or server error.'
  })
  @Get()
  async findAll(
    @Query('page')
    page?: number,
    @Query('limit')
    limit?: number
  ) {
    try {
      const paginationOptions: Pagination = {
        page: isNaN(page) ? 1 : page,
        limit: isNaN(limit) ? 25 : limit
      };
      const watches = await this.watchesService.findAll(paginationOptions);
      const totalWatchCount = await this.watchesService.count();
      return {
        count: watches.length,
        number_of_pages: Math.ceil(totalWatchCount / paginationOptions.limit),
        watches
      };
    } catch (err) {
      this.routeLoggingService.setCustomMessage('findAll() route handler call');
      this.routeLoggingService.setErrorStack(err.stack);
      this.routeLoggingService.setErrorMessage(err.message);
      this.routeLoggingService.log();
      throw new HttpException(
        'Something went wrong on our side while trying to find the resource.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: 'Find a watch' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'id must be of type integer.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Watch not found.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Watches have been fetched succesfully.'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Query or server error.'
  })
  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })
    )
    id: number
  ) {
    const watch = await this.watchesService.findOne(id);
    if (watch === null) {
      throw new HttpException('Watch not found.', HttpStatus.NOT_FOUND);
    }
    return watch;
  }

  @ApiOperation({ summary: 'Update an existing watch' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'id must be of type integer.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Watch not found.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Watch has been updated succesfully.'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Query or server error.'
  })
  @Patch(':id')
  async update(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })
    )
    id: number,
    @Body() updateWatchDto: UpdateWatchDto
  ) {
    if (JSON.stringify(updateWatchDto) === '{}') {
      throw new HttpException('Request body is empty.', HttpStatus.BAD_REQUEST);
    }
    const watch = await this.watchesService.findOne(id);
    if (watch === null) {
      throw new HttpException('Watch not found.', HttpStatus.NOT_FOUND);
    }

    try {
      await this.watchesService.update(id, updateWatchDto);
      return {
        message: 'Watch has been updated succesfully.',
        updateWatchDto
      };
    } catch (err) {
      this.routeLoggingService.setCustomMessage(
        `update() route handler call with id ${id}`
      );
      this.routeLoggingService.setPayload(updateWatchDto);
      this.routeLoggingService.setErrorStack(err.stack);
      this.routeLoggingService.setErrorMessage(err.message);
      this.routeLoggingService.log();
      throw new HttpException(
        'Something went wrong on our side while trying to update the resource.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: 'Delete an existing watch' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Watch not found.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'id must be of type integer.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Watch has been deleted succesfully.'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Query or server error.'
  })
  @Delete(':id')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })
    )
    id: number
  ) {
    const watch = await this.watchesService.findOne(id);
    if (watch === null) {
      throw new HttpException('Watch not found.', HttpStatus.NOT_FOUND);
    }

    try {
      await this.watchesService.remove(id);
      return {
        message: 'Watch has been deleted succesfully.'
      };
    } catch (err) {
      this.routeLoggingService.setCustomMessage(
        `remove() route handler call with id ${id}`
      );
      this.routeLoggingService.setErrorStack(err.stack);
      this.routeLoggingService.setErrorMessage(err.message);
      this.routeLoggingService.log();
      throw new HttpException(
        'Something went wrong on our side while trying to delete the resource.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
