import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from "../entities/user.entity";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../helpers/jwtPayload.interface";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token'
) {
    constructor(
        private authService: AuthService,
    ) {
        super({
            secretOrKey: process.env.JWT_SECRET_REFRESH,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: JwtPayload): Promise<User> {
        const header = request.headers["authorization"];
        const splitHeader = header.split(' ');
        if (splitHeader[0] === '') {
            throw new UnauthorizedException();
        }
        const refreshToken = splitHeader[1];
        const user = await this.authService.getUserIfRefreshTokenMatches(
            refreshToken, 
            payload.id
        );

        if (user.level2factor_auth === 'false') {
            return user;
        }

        if (payload.twoFAisAuthenticated) {
            return user;
        }

        throw new UnauthorizedException();
    }
}