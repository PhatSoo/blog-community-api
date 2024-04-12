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
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRequest } from 'src/types';

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
    @UseGuards(AuthGuard)
    createPost(@Req() req: UserRequest, @Body() createPostDTO: CreatePostDTO) {
        return this.postService.create(createPostDTO, req.userInfo.userId);
    }

    @Patch(':slug')
    @UseGuards(AuthGuard)
    editPost(
        @Req() req: UserRequest,
        @Body() editPostDTO: EditPostDTO,
        @Param('slug') slug: string,
    ) {
        return this.postService.edit(req, editPostDTO, slug);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    deletePost(@Req() req: UserRequest, @Param('slug') slug: string) {
        return this.postService.delete(req, slug);
    }
}
