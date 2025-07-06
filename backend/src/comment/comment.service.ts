import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { differenceInMinutes } from 'date-fns';


@Injectable()
export class CommentService {

    constructor(private readonly databaseService: DatabaseService) { }

    async createComment(commentDto: CreateCommentDto, userId: number) {
        if (commentDto.parentId) {
            const parentId = this.databaseService.comment.findFirst({
                where: {
                    id: commentDto.parentId,
                    deleted: false
                }
            });
            if (!parentId) {
                throw new NotFoundException('Parent Comment does no exist or might be deleted')
            }
        }

        return this.databaseService.comment.create({
            data: {
                body: commentDto.body,
                parentId: commentDto.parentId ?? null,
                authorId: userId
            },
            include: { author: { select: { username: true } } },
        });
    }

    async deleteComment(id: number, userId: number) {
        const comment = await this.databaseService.comment.findUnique({
            where: { id },
            select: { authorId: true, deleted: true },
        });
        if (!comment) {
            throw new NotFoundException("Comment Not Found");
        }
        if (comment.deleted) {
            return { "message": "Comment Already Deleted" }
        }
        if (comment.authorId !== userId) {
            throw new ForbiddenException("Not Your Comment")
        }

        await this.databaseService.comment.update({
            where: { id },
            data: {
                deleted: true,
                deletedAt: new Date(),
            }
        });
        return { "message": "Comment Already Deleted" }
    }

    async restore(id: number, userId: number) {
        const comment = await this.databaseService.comment.findUnique({
            where: { id },
            select: { authorId: true, deleted: true, deletedAt: true },
        });
        if (!comment || !comment.deleted) throw new NotFoundException();

        if (comment.authorId !== userId)
            throw new ForbiddenException('Not your comment');

        if (
            !comment.deletedAt ||
            differenceInMinutes(new Date(), comment.deletedAt) > 15
        )
            throw new ForbiddenException('Restore window expired');

        return this.databaseService.comment.update({
            where: { id },
            data: { deleted: false, deletedAt: null },
        });
    }

    async getAll() {
        return this.databaseService.comment.findMany({
            where: { deleted: false ,parentId:null},
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { username: true } } },

        });
    }

    async getReplies(
        parentId: number,
        opts: { cursor?: string; limit?: number },
    ) {
        const limit = opts.limit ?? 20;

        const rows = await this.databaseService.comment.findMany({
            where: { parentId, deleted: false },
            orderBy: { createdAt: 'asc' },
            cursor: opts.cursor ? { id: Number(opts.cursor) } : undefined,
            skip: opts.cursor ? 1 : 0,
            take: limit,
            include: { author: { select: { username: true } } },
        });

        const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
        return { data: rows, nextCursor };
    }

    async getThread(rootId: number, depth = Infinity) {
        const rows = await this.databaseService.$queryRawUnsafe<any[]>(`
      WITH RECURSIVE subtree AS (
        SELECT *, 0 AS depth
        FROM "comments"
        WHERE id = ${rootId}

        UNION ALL

        SELECT c.*, s.depth + 1
        FROM "comments" c
        JOIN subtree s ON c."parentId" = s.id
        WHERE s.depth + 1 <= ${depth} AND c.deleted = false
      )
      SELECT * FROM subtree ORDER BY depth, "createdAt";
    `);

        return this.buildTree(rows);
    }

    private buildTree(rows: any[]) {
        const map = new Map<number, any>();
        const roots: any[] = [];

        rows.forEach((row) =>
            map.set(row.id, { ...row, children: [] }),
        );
        map.forEach((node) => {
            if (node.parentId) map.get(node.parentId)?.children.push(node);
            else roots.push(node);
        });
        return roots;
    }

}
