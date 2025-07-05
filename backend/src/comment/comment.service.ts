import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CommentService {

    constructor(private readonly databaseService: DatabaseService) { }

    async get(){
        
    }

}
