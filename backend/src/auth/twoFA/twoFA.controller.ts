import { Controller, Res, UseGuards, Post, HttpCode, Body, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';
import { GetUser } from '../helpers/get-user.decorator';
import { TwoFAService } from './twoFA.service';
import { Response } from 'express';
import { GetCodeDto } from '../dto/getCode.dto';
import JwtGuard from '../strategies/jwt.guard';
import { TwoFACredsDto } from '../dto/twoFACreds.dto';

@Controller('2fa')
export class TwoFAController {
    constructor(
        private twoFAService: TwoFAService,
        private authService: AuthService
    ) {}

    @Post('generate-qrcode')
    @UseGuards(JwtGuard)
    async register(@Res() response: Response, @GetUser() user: User) {
        const otpAuthUrl = await this.twoFAService.generate2FASecret(user);
        const qrStream = await this.twoFAService.qrCodeStream(response, otpAuthUrl);
        return { qrStream };
    }

    @Post('turn-on')
    @UseGuards(JwtGuard)
    async turnOn2FA(@GetUser() user: User, @Body() getCodeDto: GetCodeDto) {
        const codeIsValid = await this.twoFAService.validate2FAcode(
            user.id,
            getCodeDto.code
        );
        if (!codeIsValid) {
            return undefined;
        }
        const updatedUser = await this.authService.turnOn2FA(user.id);
        const accessToken = await this.authService.getAccessToken(updatedUser, true);
        const refreshToken = await this.authService.getRefreshToken(updatedUser, true);
        return { updatedUser, accessToken, refreshToken };
    }

    @Post('turn-off')
    @UseGuards(JwtGuard)
    async turnOff2FA(@GetUser() user: User, @Body() getCodeDto: GetCodeDto) {
        const codeIsValid = await this.twoFAService.validate2FAcode(
            user.id,
            getCodeDto.code
        );
        if (!codeIsValid) {
            return undefined;
        }
        const updatedUser = await this.authService.turnOff2FA(user.id);
        const accessToken = await this.authService.getAccessToken(updatedUser);
        const refreshToken = await this.authService.getRefreshToken(updatedUser);
        return { updatedUser, accessToken, refreshToken };
    }

    @Post('authenticate')
    async authenticate2FA(@Body() twoFACreds: TwoFACredsDto) {
        const codeIsValid = await this.twoFAService.validate2FAcode(
            twoFACreds.user.id, 
            twoFACreds.code
        );
        if (!codeIsValid) {
            return undefined;
        }
        const accessToken = await this.authService.getAccessToken(twoFACreds.user, true);
        const refreshToken = await this.authService.getRefreshToken(twoFACreds.user, true);
        await this.authService.setCurrentRefreshToken(refreshToken, twoFACreds.user.id);
        return { user: twoFACreds.user, accessToken, refreshToken }
    }
}