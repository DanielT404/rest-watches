import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Response } from 'express';
import {
  ParseIntPipe,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Inject,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WatchesService } from 'src/watches/watches.service';
import { CreateWatchDto } from 'src/watches/dto/create-watch.dto';
import { ExistsWatchDto } from 'src/watches/dto/exists-watch.dto';
import { UpdateWatchDto } from 'src/watches/dto/update-watch.dto';
import { Pagination } from 'src/utils/types/Pagination';

@ApiTags('watches')
@Controller('watches')
export class WatchesController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
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
  async create(@Body() createWatchDto: CreateWatchDto, @Res() res: Response) {
    const exists = await this.watchesService.exists(
      createWatchDto as ExistsWatchDto
    );
    if (exists) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: `The watch you're trying to add already exists, please try again.`
      });
    }

    try {
      await this.watchesService.create(createWatchDto);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'A new watch has been added succesfully.'
      });
    } catch (err) {
      this.logger.log(
        'error',
        `${
          HttpStatus.INTERNAL_SERVER_ERROR
        } response on create() route handler call with payload: \n ${JSON.stringify(
          createWatchDto
        )} \n Err stack: ${err.stack} \n Err message: ${err.message}`,
        WatchesController.name
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'Something went wrong on our side while trying to create the resource.'
      });
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
    @Res() res: Response,
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
      return res.status(HttpStatus.OK).json({
        success: true,
        watches,
        count: watches.length,
        number_of_pages: Math.ceil(totalWatchCount / paginationOptions.limit)
      });
    } catch (err) {
      this.logger.log(
        'error',
        `${HttpStatus.INTERNAL_SERVER_ERROR} response on findAll() route handler call \n Err stack: ${err.stack} | ${err.message} \n`,
        WatchesController.name
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'Something went wrong on our side while trying to find the resource.'
      });
    }
  }

  @ApiOperation({ summary: 'Find a watch' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests.'
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
    @Res() res: Response,
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })
    )
    id: number
  ) {
    try {
      const watch = await this.watchesService.findOne(id);
      if (watch === null) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Watch not found.'
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        watch
      });
    } catch (err) {
      this.logger.log(
        'error',
        `${HttpStatus.INTERNAL_SERVER_ERROR} response on findOne() route handler call with id ${id} \n Err stack: ${err.stack} \n Err message: ${err.message}`,
        WatchesController.name
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'Something went wrong on our side while trying to fetch the resource.'
      });
    }
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
    @Res() res: Response,
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
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Request body is empty.'
      });
    }
    const watch = await this.watchesService.findOne(id);
    if (watch === null) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Watch not found.'
      });
    }

    try {
      await this.watchesService.update(id, updateWatchDto);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Watch has been updated succesfully.'
      });
    } catch (err) {
      this.logger.log(
        'error',
        `${HttpStatus.INTERNAL_SERVER_ERROR} response on update() route handler call with id ${id} \n Err stack: ${err.stack} \n Err message: ${err.message}`,
        WatchesController.name
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'Something went wrong on our side while trying to update the resource.'
      });
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
    @Res() res: Response,
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })
    )
    id: number
  ) {
    const watch = await this.watchesService.findOne(id);
    if (watch === null)
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Watch not found.'
      });

    try {
      await this.watchesService.remove(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Watch has been deleted succesfully.'
      });
    } catch (err) {
      this.logger.log(
        'error',
        `${HttpStatus.INTERNAL_SERVER_ERROR} response on remove() route handler call with id ${id} \n Err stack: ${err.stack} \n Err message: ${err.message}`,
        WatchesController.name
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          'Something went wrong on our side while trying to delete the resource.'
      });
    }
  }
}
