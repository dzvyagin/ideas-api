import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request) {
      const authToken = request.headers.authorization;

      if (!authToken) {
        return false;
      }

      request.user = await this.validateToken(authToken);

      return true;
    } else {
      const ctx: any = GqlExecutionContext.create(context).getContext();

      if (!ctx.headers.authorization) {
        return false;
      }

      ctx.user = await this.validateToken(ctx.headers.authorization);

      return true;
    }
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }

    const token = auth.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, process.env.SECRET);

      return decoded;
    } catch (err) {
      const message = `Token error: ${err.message || err.name}`;
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
