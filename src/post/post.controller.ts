import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { CreatePostDTO, EditPostDTO } from '../dtos';
import { PostService } from './post.service';
import { UserRequest } from '../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostGuard } from './post.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@Controller('post')
export class PostController {
    constructor(private postService: PostService) {}

    @Get()
    list(@Query('sortBy') sortBy: string = 'createdAt') {
        // createdAt || views || likes || interactives
        return this.postService.list(sortBy);
    }

    @Get(':slug')
    @UseInterceptors(CacheInterceptor)
    @CacheKey('post-details-by-slug')
    getDetail(@Param('slug') slug: string) {
        return this.postService.getDetails(slug);
    }

    @Get('user/:createdBy')
    @UseInterceptors(CacheInterceptor)
    @CacheKey('post-details-by-user')
    getPostByUserId(@Param('createdBy') createdBy: string) {
        return this.postService.getPostByUserId(createdBy);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    createPost(@Req() req: UserRequest, @Body() createPostDTO: CreatePostDTO) {
        return this.postService.create(createPostDTO, req.user.id);
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
}
