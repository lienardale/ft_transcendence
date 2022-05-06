import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from "../helpers/jwtPayload.interface";
import { User } from "../entities/user.entity";
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    'jwt'
){
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            secretOrKey: process.env.JWT_SECRET_ACCESS,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { id } = payload;
        const user: User = await this.userRepository.findOne(id);
        if (!user) {
            throw new UnauthorizedException();
        }
        if (user.level2factor_auth === 'false') {
            return user;
        }
        if (payload.twoFAisAuthenticated) {
            return user;
        }
    }
}