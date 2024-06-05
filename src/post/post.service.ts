import {
    BadRequestException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDTO, EditPostDTO } from '../dtos';
import { Post } from 'src/schemas';
import { ResponseType } from '../types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async list(sortBy: string): Promise<ResponseType> {
        const redisKey = `list-post-by-${sortBy}`;

        if (!(await this.cacheManager.get(redisKey))) {
            const sortOption = {};
            sortOption[sortBy] = 'desc';

            const data = await this.postModel
                .find({ status: true })
                .populate('createdBy')
                .sort(sortOption)
                .exec();
            await this.cacheManager.set(redisKey, data);
            return {
                message: 'List all posts success!',
                statusCode: HttpStatus.OK,
                data,
            };
        }

        return {
            message: 'List all posts success!',
            statusCode: HttpStatus.OK,
            data: await this.cacheManager.get(redisKey),
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

        if (foundPost) {
            this.logger.error('Post title has been used!');
            throw new BadRequestException(`Post title has been used!`);
        }

        const postData = {
            ...createPost,
            createdBy: new Types.ObjectId(userId),
        };

        await this.cacheManager.set(
            'list-post-by-createdAt',
            await this.postModel.find({}).sort('-createdAt'),
        );

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

        for (const key in editPostDTO) {
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
        if (!foundPost) {
            this.logger.error('Post not found!');
            throw new NotFoundException('Post not found!');
        }

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
