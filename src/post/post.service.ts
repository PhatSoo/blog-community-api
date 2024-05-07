import {
    BadRequestException,
    ForbiddenException,
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDTO, CreatePostDTO, EditPostDTO } from '../dtos';
import { Post } from 'src/schemas';
import { ResponseType, UserRequest } from '../types';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        private commentService: CommentService,
    ) {}

    async list(sortBy: string): Promise<ResponseType> {
        const sortOption = {};
        sortOption[sortBy] = 'desc';

        return {
            message: 'List all posts success!',
            statusCode: HttpStatus.OK,
            data: await this.postModel
                .find({ status: true })
                .populate('createdBy')
                .sort(sortOption)
                .exec(),
        };
    }

    async getDetails(slug: string): Promise<ResponseType> {
        return {
            message: 'Get post details success',
            statusCode: HttpStatus.OK,
            data: await this.postModel
                .findOne({ slug })
                .populate('createdBy')
                .exec(),
        };
    }

    async getPostByUserId(userId: string): Promise<ResponseType> {
        return {
            message: 'List posts by userId success!',
            statusCode: HttpStatus.OK,
            data: await this.postModel
                .find({
                    createdBy: new Types.ObjectId(userId),
                })
                .exec(),
        };
    }

    async create(
        createPost: CreatePostDTO,
        userId: string,
    ): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({
            title: createPost.title,
        });

        if (foundPost)
            throw new BadRequestException(`Post title has been used!`);

        const postData = {
            ...createPost,
            createdBy: new Types.ObjectId(userId),
        };

        return {
            message: 'Create post success!',
            statusCode: HttpStatus.CREATED,
            data: await this.postModel.create(postData),
        };
    }

    async edit(editPostDTO: EditPostDTO, slug: string): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });
        if (!foundPost) throw new NotFoundException('Post not found!');

        // remove slug if have no title
        if (!editPostDTO.title && editPostDTO.slug) {
            delete editPostDTO.slug;
        }

        for (let key in editPostDTO) {
            foundPost[key] = editPostDTO[key];
        }

        return {
            message: 'Create post success!',
            statusCode: HttpStatus.CREATED,
            data: await foundPost.save(),
        };
    }

    async delete(slug: string): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });
        if (!foundPost) throw new NotFoundException('Post not found!');

        const deletedPost = await this.postModel.deleteOne({ slug });

        if (!deletedPost) throw new BadRequestException('Delete post failed!');

        return {
            message: 'Remove post success!',
            statusCode: HttpStatus.OK,
        };
    }

    async checkPermission(userId: string, slug: string) {
        const foundPostOfUser = await this.postModel.findOne({
            createdBy: new Types.ObjectId(userId),
            slug,
        });

        if (foundPostOfUser) return true;

        return false;
    }
}
