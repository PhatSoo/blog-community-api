import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDTO, EditCommentDTO } from '../dtos';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentGuard } from './comment.guard';
import { UserRequest } from 'src/types';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('comment')
export class CommentController {
    constructor(private commentService: CommentService) {}

    // 1. Get comments from post
    @Get('/:slug')
    @UseInterceptors(CacheInterceptor)
    async getComment(@Param('slug') slug: string) {
        return this.commentService.getCommentsBySlug(slug);
    }

    // 2. Create comment for post
    @Post('/:slug')
    @UseGuards(JwtAuthGuard)
    async createComment(
        @Req() req: UserRequest,
        @Param('slug') slug: string,
        @Body() createCommentDTO: CreateCommentDTO,
    ) {
        return this.commentService.create(req.user.id, slug, createCommentDTO);
    }

    // 3. Create sub-comment for post
    @Post('/:slug/reply/:commentId')
    @UseGuards(JwtAuthGuard)
    async createSubComment(
        @Req() req: UserRequest,
        @Param('slug') slug: string,
        @Param('commentId') commentId: string,
        @Body() createCommentDTO: CreateCommentDTO,
    ) {
        return this.commentService.createSubComment(
            req.user.id,
            slug,
            commentId,
            createCommentDTO,
        );
    }

    @Patch(':id')
    @UseGuards(CommentGuard)
    async editComment(
        @Body() editCommentDTO: EditCommentDTO,
        @Param('id') id: string,
    ) {
        return this.commentService.editComment(id, editCommentDTO);
    }

    @Delete(':id')
    @UseGuards(CommentGuard)
    async deleteComment(@Param('id') id: string) {
        return this.commentService.deleteComment(id);
    }
}
