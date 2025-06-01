import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the called endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    // All other endpoints require API key authentication
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['x-api-key'];
    const configuredKey = this.configService.get<string>('apiKey');

    if (configuredKey && authHeader !== configuredKey) throw new UnauthorizedException('Invalid API key');
    return true;
  }
}
