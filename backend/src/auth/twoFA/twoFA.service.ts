import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { authenticator } from 'otplib';
import { User } from "../entities/user.entity";
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFAService {
    constructor (
        private authService: AuthService,
    ) {}

    public async generate2FASecret(user: User
        ): Promise<string> {
        const secret = authenticator.generateSecret();
        const otpAuthUrl: string = authenticator.keyuri(
            user.email,
            process.env.TWO_FA_APP_NAME, 
            secret
        );
        await this.authService.set2FASecret(secret, user.id);
        return otpAuthUrl;
    }

    public async qrCodeStream(stream: Response, otpAuthUrl: string) {
        return toFileStream(stream, otpAuthUrl);
    }

    public async validate2FAcode(userId: number, twoFACode: string): Promise<boolean> {
        const user = await this.authService.getUserById(userId);
        let verif : boolean;
        try {
            verif = authenticator.verify({
                token: twoFACode,
                secret: user.level2factor_secret
            })
            return verif;
        } catch (error) {
            return false;
        }
    }
}