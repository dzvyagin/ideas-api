import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { AuthGuard } from 'src/shared/auth.guard';
import { IdeaDTO } from './idea.dto';
import { IdeaService } from './idea.service';
import { ValidationPipe } from '../shared/validation.pipe';
import { User } from 'src/user/user.decorator';

@Controller('api/ideas')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(private ideaService: IdeaService) {}

  private logData(options: any) {
    options.user && this.logger.log('USER' + JSON.stringify(options.user));
    options.data && this.logger.log('DATA' + JSON.stringify(options.data));
    options.id && this.logger.log('IDEA' + JSON.stringify(options.id));
  }

  @Get()
  showAllIdeas(@Query('page') page: number) {
    return this.ideaService.showAll(page);
  }

  @Get('/newest')
  showNewestIdeas(@Query('page') page: number) {
    return this.ideaService.showAll(page, true);
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createIdea(@User('id') userId: any, @Body() data: IdeaDTO) {
    this.logData({ userId, data });
    return this.ideaService.create(userId, data);
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  updateIdea(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() data: Partial<IdeaDTO>,
  ) {
    this.logData({ id, userId, data });
    return this.ideaService.update(id, userId, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  deleteIdea(@Param('id') id: string, @User() userId: string) {
    this.logData({ id, userId });
    return this.ideaService.delete(id, userId);
  }

  @Post(':id/upvote')
  @UseGuards(new AuthGuard())
  upvoteIdea(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.upvote(id, userId);
  }

  @Post(':id/downvote')
  @UseGuards(new AuthGuard())
  downvoteIdea(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.downvote(id, userId);
  }

  @Post(':id/bookmark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.bookmark(id, userId);
  }

  @Delete(':id/bookmark')
  @UseGuards(new AuthGuard())
  unbookmarkIdea(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.unbookmark(id, userId);
  }
}
