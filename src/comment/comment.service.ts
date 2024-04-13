import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../schemas';
import { CreateCommentDTO, EditCommentDTO } from '../dtos';
import { ResponseType } from '../types';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
    ) {}

    async getPostComment(postId: Types.ObjectId) {
        return await this.commentModel.aggregate([
            {
                $match: {
                    parentId: null,
                    postId,
                },
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'replies',
                },
            },
        ]);
    }

    async createPostComment(
        userId: string,
        postId: Types.ObjectId,
        createCommentDTO: CreateCommentDTO,
    ) {
        return await this.commentModel.create({
            userId: new Types.ObjectId(userId),
            postId,
            ...createCommentDTO,
        });
    }

    async createPostSubComment(
        userId: string,
        postId: Types.ObjectId,
        commentId: string,
        createCommentDTO: CreateCommentDTO,
    ) {
        return await this.commentModel.create({
            userId: new Types.ObjectId(userId),
            postId,
            parentId: new Types.ObjectId(commentId),
            ...createCommentDTO,
        });
    }

    async editComment(
        id: string,
        editCommentDTO: EditCommentDTO,
    ): Promise<ResponseType> {
        const foundComment = await this.commentModel.findById(id).exec();

        for (let key in editCommentDTO) {
            foundComment[key] = editCommentDTO[key];
        }

        return {
            message: 'Edit comment success',
            statusCode: HttpStatus.OK,
            data: await foundComment.save(),
        };
    }

    async deleteComment(id: string): Promise<ResponseType> {
        const deletedComment = await this.commentModel.findByIdAndDelete(id);
        if (!deletedComment)
            throw new BadRequestException('Something went wrong!');

        return {
            message: 'Delete comment success',
            statusCode: HttpStatus.OK,
        };
    }

    async checkPermission(userId: string, commentId: string) {
        const foundCommentOfUser = await this.commentModel.findById(commentId);

        if (!foundCommentOfUser)
            throw new NotFoundException('Comment not found!');

        return foundCommentOfUser.userId.toString() === userId;
    }
}
