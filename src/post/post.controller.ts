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
import { CreatePostDTO, EditPostDTO } from '../dtos';
import { PostService } from './post.service';
import { UserRequest } from '../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('post')
export class PostController {
    constructor(private postService: PostService) {}

    @Get()
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
    @UseGuards(JwtAuthGuard)
    editPost(
        @Req() req: UserRequest,
        @Body() editPostDTO: EditPostDTO,
        @Param('slug') slug: string,
    ) {
        return this.postService.edit(req, editPostDTO, slug);
    }

    @Delete(':slug')
    @UseGuards(JwtAuthGuard)
    deletePost(@Req() req: UserRequest, @Param('slug') slug: string) {
        return this.postService.delete(req, slug);
    }
}
