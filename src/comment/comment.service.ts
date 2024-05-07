import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, Post } from '../schemas';
import { CreateCommentDTO, EditCommentDTO } from '../dtos';
import { ResponseType } from '../types';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @InjectModel(Post.name) private postModel: Model<Post>,
    ) {}

    async getCommentsBySlug(slug: string): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });

        if (!foundPost) throw new NotFoundException('Post not found!');

        // console.log(await this.commentModel.find({}));

        const comments = await this.commentModel.aggregate([
            {
                $match: {
                    parentId: null,
                    postId: foundPost._id,
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
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $unset: [
                    'user.password',
                    'user.createdAt',
                    'user.updatedAt',
                    'user.__v',
                ],
            },
            {
                $project: {
                    _id: 1,
                    postId: 1,
                    user: 1,
                    replies: 1,
                    message: 1,
                },
            },
        ]);

        return {
            message: "Get post's comment success!",
            statusCode: HttpStatus.OK,
            data: comments,
        };
    }

    async create(
        userId: string,
        slug: string,
        createCommentDTO: CreateCommentDTO,
    ): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });

        if (!foundPost) throw new NotFoundException('Post not found!');

        const createdComment = await this.commentModel.create({
            userId: new Types.ObjectId(userId),
            postId: foundPost._id,
            ...createCommentDTO,
        });

        if (!createdComment)
            throw new BadRequestException('Create comment failed!');

        return {
            message: 'Create comment success!',
            statusCode: HttpStatus.CREATED,
            data: createdComment,
        };
    }

    async createSubComment(
        userId: string,
        slug: string,
        commentId: string,
        createCommentDTO: CreateCommentDTO,
    ): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });

        if (!foundPost) throw new NotFoundException('Post not found!');

        const createdComment = await this.commentModel.create({
            userId: new Types.ObjectId(userId),
            postId: foundPost._id,
            parentId: new Types.ObjectId(commentId),
            ...createCommentDTO,
        });

        if (!createdComment)
            throw new BadRequestException('Create sub-comment failed');

        return {
            message: 'Create sub-comment success!',
            statusCode: HttpStatus.CREATED,
            data: createdComment,
        };
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
