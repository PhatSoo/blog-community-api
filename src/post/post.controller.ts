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
} from '@nestjs/common';
import { CreateCommentDTO, CreatePostDTO, EditPostDTO } from '../dtos';
import { PostService } from './post.service';
import { UserRequest } from '../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostGuard } from './post.guard';

@Controller('post')
export class PostController {
    constructor(private postService: PostService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    list() {
        return this.postService.list();
    }

    @Get(':slug')
    getDetail(@Param('slug') slug: string) {
        return this.postService.getDetails(slug);
    }

    @Get('user/:createdBy')
    getPostByUserId(@Param('createdBy') createdBy: string) {
        return this.postService.getPostByUserId(createdBy);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    createPost(@Req() req: UserRequest, @Body() createPostDTO: CreatePostDTO) {
        return this.postService.create(createPostDTO, req.user.userId);
    }

    @Patch(':slug')
    @UseGuards(JwtAuthGuard, PostGuard)
    editPost(@Body() editPostDTO: EditPostDTO, @Param('slug') slug: string) {
        return this.postService.edit(editPostDTO, slug);
    }

    @Delete(':slug')
    @UseGuards(JwtAuthGuard, PostGuard)
    deletePost(@Param('slug') slug: string) {
        return this.postService.delete(slug);
    }

    /* =====POST COMMENT===== */
    // 1. Get comments from post
    @Get('/:slug/comment')
    async getComment(@Param('slug') slug: string) {
        return this.postService.getPostComment(slug);
    }

    // 2. Create comment for post
    @Post('/:slug/comment')
    @UseGuards(JwtAuthGuard)
    async createComment(
        @Req() req: UserRequest,
        @Param('slug') slug: string,
        @Body() createCommentDTO: CreateCommentDTO,
    ) {
        return this.postService.createComment(req, slug, createCommentDTO);
    }

    // 3. Create comment for post
    @Post('/:slug/comment/:commentId')
    @UseGuards(JwtAuthGuard)
    async createSubComment(
        @Req() req: UserRequest,
        @Param('slug') slug: string,
        @Param('commentId') commentId: string,
        @Body() createCommentDTO: CreateCommentDTO,
    ) {
        return this.postService.createSubComment(
            req,
            slug,
            commentId,
            createCommentDTO,
        );
    }
}
