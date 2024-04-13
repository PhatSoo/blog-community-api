import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CommentService } from './comment.service';

@Injectable()
export class CommentGuard implements CanActivate {
    constructor(private commentService: CommentService) {}
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();

        const { userId } = req.user;

        const { id } = req.params;

        const checkPermission = this.commentService.checkPermission(userId, id);

        return checkPermission;
    }
}
