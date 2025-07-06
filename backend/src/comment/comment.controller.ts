import {
  Controller, Get, Post, Delete,
  Param, Body, Query, Req,
  ParseIntPipe, UseGuards, ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard, AuthenticatedRequest } from 'src/guards/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }
  @Post()
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

  @Post(':id/restore')
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

  @Get(':id/replies')
  async getReplies(
    @Param('id', ParseIntPipe) id: number,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
  ) {
    return this.commentService.getReplies(id, { cursor, limit });
  }

  @Get(':id/thread')
  async getThread(
    @Param('id', ParseIntPipe) id: number,
    @Query('depth', ParseIntPipe) depth?: number,
  ) {
    return this.commentService.getThread(id, depth ?? 1);
  }
}
