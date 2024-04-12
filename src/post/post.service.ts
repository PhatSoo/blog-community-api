import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDTO, EditPostDTO } from '../dtos';
import { Post } from 'src/schemas';
import { ResponseType, UserRequest } from '../types';
import { ConvertSlug } from 'src/utils';

@Injectable()
export class PostService {
    constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

    async list(): Promise<ResponseType> {
        return {
            message: 'List all posts success!',
            statusCode: HttpStatus.OK,
            data: await this.postModel.find().populate('createdBy').exec(),
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

    async edit(
        req: UserRequest,
        editPostDTO: EditPostDTO,
        slug: string,
    ): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });
        if (!foundPost) throw new NotFoundException('Post not found!');

        const checkPermission = await this.checkPermission(
            req.userInfo.userId,
            slug,
        );

        if (!checkPermission)
            throw new UnauthorizedException(
                'You have no permission for this feature!',
            );

        // remove slug if have no title
        if (!editPostDTO.title && editPostDTO.slug) {
            delete editPostDTO.slug;
        }

        // if have title => generate slug
        if (editPostDTO.title) {
            editPostDTO.slug = ConvertSlug(editPostDTO.title);
        }

        return {
            message: 'Create post success!',
            statusCode: HttpStatus.CREATED,
            data: await this.postModel.findOneAndUpdate(
                { slug },
                { $set: editPostDTO },
                { new: true },
            ),
        };
    }

    async delete(req: UserRequest, slug: string): Promise<ResponseType> {
        const foundPost = await this.postModel.findOne({ slug });
        if (!foundPost) throw new NotFoundException('Post not found!');

        const checkPermission = await this.checkPermission(
            req.userInfo.userId,
            slug,
        );

        if (!checkPermission)
            throw new UnauthorizedException(
                'You have no permission for this feature!',
            );

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
