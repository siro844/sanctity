import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {

    constructor(private readonly databaseService: DatabaseService) { }

    async createComment(commentDto: CreateCommentDto, userId: number){
        
    }

    async deleteComment(id:number ,userId:number){

    }

    async restore(id:number,userId:number){

    }

    async getAll(){

    }

    async getReplies(id:number,{cursor:string,limit:number}){

    }

    async getThread(id:number , depth:number){
        
    }

}
