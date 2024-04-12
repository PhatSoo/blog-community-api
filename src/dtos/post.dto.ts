import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDTO {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    content: string;
}

export class EditPostDTO {
    @IsOptional()
    title: string;

    @IsOptional()
    content: string;

    @IsOptional()
    status: boolean;

    @IsOptional()
    slug: string;
}
