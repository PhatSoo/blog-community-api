import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDTO {
    @IsNotEmpty()
    content: string;
}

export class EditCommentDTO {
    @IsOptional()
    @IsString()
    content: string;

    @IsOptional()
    @IsBoolean()
    status: boolean;
}
