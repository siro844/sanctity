import { Controller, Get, UseGuards, ValidationPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async get(){
    return {message:"Authenticated"};
  }
}
