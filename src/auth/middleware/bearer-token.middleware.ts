import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction } from "express";
import { envVariables } from "src/commons/const/env.const";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}
    
    async use(req: any, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
     
        if (!authHeader) {
            next();
            return;
        }


    
        try {
            const token = this.validateBearerToken(authHeader);

            const decodedPayload = this.jwtService.decode(token);

            if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
                throw new UnauthorizedException('잘못된 토큰입니다.');
            }

            const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.getOrThrow<string>(
                decodedPayload.type === 'refresh' ? envVariables.refreshTokenSecret : envVariables.accessTokenSecret
                )
            });

            req.user = payload;
            next();
            } catch(e) {
                if (e.name === 'TokenExpiredError') {
                    throw new UnauthorizedException('토큰이 만료됐습니다.');
                }
                next();
            }

    }

    validateBearerToken(rawToken: string) {

        const basicSplit = rawToken.split(' ');
        
         if (basicSplit.length !== 2) {
                 throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
             }
     
             const [bearer, token] = basicSplit;
     
             if (bearer.toLowerCase() !== 'bearer') {
                 throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
             }

        return token;
    }
}