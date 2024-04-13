import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PostService } from './post.service';

@Injectable()
export class PostGuard implements CanActivate {
    constructor(private postService: PostService) {}
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();

        const { userId } = req.user;

        const { slug } = req.params;

        const checkPermission = this.postService.checkPermission(userId, slug);

        return checkPermission;
    }
}
