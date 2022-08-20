import { CommentDTO } from './comment.dto';
import { ValidationPipe } from './../shared/validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';

@Controller('api/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Get('/idea/:id')
  showCommentsByIdea(@Param('id') ideaId: string) {
    return this.commentService.showByIdea(ideaId);
  }

  @Get('user/:id')
  showCommentsByUser(@Param('id') userId: string) {
    return this.commentService.showByUser(userId);
  }

  @Post('idea/:id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createComment(
    @Param('id') ideaId: string,
    @User('id') userId: string,
    @Body() data: CommentDTO,
  ) {
    return this.commentService.create(ideaId, userId, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyComment(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.destroy(id, userId);
  }
}
