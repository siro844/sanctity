import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest} from 'express';
import { CONFIGURABLE_MODULE_ID } from '@nestjs/common/module-utils/constants';

interface AuthenticatedRequest extends ExpressRequest {
    userId?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request= context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }
        try {
            const payload = this.jwtService.verify(token);
            request.userId = payload.userId;
        } catch (e) {
            Logger.error('Token verification failed', e.message);
            throw new UnauthorizedException('Invalid token');
        }
        return true;
    }

    private extractTokenFromHeader(request: AuthenticatedRequest): string | undefined {
        return request.headers.authorization?.split(' ')[1];
    }
}