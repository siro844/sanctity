import {
  Controller, Get, Post, Delete,
  Param, Body, Query, Req,
  ParseIntPipe, UseGuards, ValidationPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard, AuthenticatedRequest } from 'src/guards/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }
  @Post('/create')
  async createComment(
    @Body(new ValidationPipe()) dto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentService.createComment(dto, req.userId!);
  }

  @Delete(':id')
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentService.deleteComment(id, req.userId!);
  }

  @Post('restore/:id')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentService.restore(id, req.userId!);
  }


  @Get('/all')
  async getAll() {
    return this.commentService.getAll();
  }

  @Get('replies/:id')
  async getReplies(
    @Param('id', ParseIntPipe) id: number,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
  ) {
    return this.commentService.getReplies(id, { cursor, limit });
  }

  @Get('thread/:id')
  async getThread(
    @Param('id', ParseIntPipe) id: number,
    @Query('depth',new DefaultValuePipe(20),ParseIntPipe) depth?: number,
  ) {
    return this.commentService.getThread(id,depth);
  }

  @Get('/deleted')
  async getDeleted(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentService.getDeleted(req.userId!);
  }
}
