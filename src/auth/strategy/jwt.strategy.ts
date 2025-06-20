import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

export class JwtAuthGuard extends AuthGuard('jwt') {
    
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configServie: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configServie.getOrThrow<string>('ACCESS_TOKEN_SECRET')
        });
    }
    async validate(payload: any) {
        return payload;
    }
}