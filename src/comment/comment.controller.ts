import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { EditCommentDTO } from '../dtos';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentGuard } from './comment.guard';

@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
    constructor(private commentService: CommentService) {}

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
