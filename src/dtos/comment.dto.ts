import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDTO {
    @IsNotEmpty()
    message: string;
}

export class EditCommentDTO {
    @IsOptional()
    @IsString()
    message: string;

    @IsOptional()
    @IsBoolean()
    status: boolean;
}
