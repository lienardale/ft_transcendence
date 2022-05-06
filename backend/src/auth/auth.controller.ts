import { Body, Controller, Get, Post, Param, Patch, UseGuards, Delete, Query, Req, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetUser } from './helpers/get-user.decorator';
import { User } from './entities/user.entity';
import { GetCodeDto } from './dto/getCode.dto';
import JwtRefreshGuard from './strategies/jwt-refresh.guard';
import { Request } from 'express';
import JwtGuard from './strategies/jwt.guard';
import { UserStatus } from 'src/auth/helpers/user.status.enum';

@Controller()
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}

    @Get('/42auth')
    async getTokenFrom42(@Query() getCodeDto: GetCodeDto,
    ) : Promise<{ user: User, accessToken: string, refreshToken: string }> {
        if (getCodeDto.code === 'undefined') { return } 
        let accessToken: string;
        let refreshToken: string;

        const token42 : string = await this.authService.getTokenFrom42(getCodeDto.code);
        const email42 : string = await this.authService.retrieveUserFrom42(token42);
        const user : User = await this.authService.api42Login(email42);

        if (user.status !== UserStatus.AWAY) { 
            accessToken = 'token-connected'
            return { user, accessToken, refreshToken }; 
        }
        
        if (user.level2factor_auth === 'true') { 
            accessToken = '2fa'
            return { user, accessToken, refreshToken }; 
        }

        accessToken = await this.authService.getAccessToken(user);
        refreshToken = await this.authService.getRefreshToken(user);
        await this.authService.setCurrentRefreshToken(refreshToken, user.id);
        return { user, accessToken, refreshToken };
    }

    @Get('/logWithToken')
    @UseGuards(JwtGuard)
    async logWithToken(@GetUser() user: User) {
        return user;
    }

    @Get('/refresh')
    @UseGuards(JwtRefreshGuard)
    async refresh(@Req() request: Request, @GetUser() user: User) : Promise<{ user: User, accessToken: string }> {
        const header = request.headers["authorization"];
        const splitHeader = header.split(' ');
        if (splitHeader[0] === '') {
            throw new UnauthorizedException();
        }
        const refreshToken = splitHeader[1];
        const refreshedUser = await this.authService.getUserIfRefreshTokenMatches(
            refreshToken,
            user.id,
        );
        if (refreshedUser) {
            let accessToken: string;
            if (user.level2factor_auth === 'false') {
                accessToken = await this.authService.getAccessToken(user);
            } else if (user.level2factor_auth === 'true') {
                accessToken = await this.authService.getAccessToken(user, true);
            }
            return { user: refreshedUser, accessToken };
        }
    }

    @Post('/check-access-token')
    async checkAccessToken(@Req() request: Request, @Body() getCodeDto: GetCodeDto) : Promise<{ result: string }> {
        const refreshedUser = await this.authService.getUserFromAuthenticationToken(getCodeDto.code);
        if (refreshedUser) {
            if (refreshedUser.status !== UserStatus.AWAY) {
                return { result: 'token-connected' };
            }
            return { result: 'token-ok' };
        }
        else {
            return { result: 'token-ko' };
        }
    }

    @Post('/check-refresh-token/:id')
    async checkRefreshToken(@Param('id') id: string, @Req() request: Request, @Body() getCodeDto: GetCodeDto) : Promise<{ result: string }> {
        const refreshedUser = await this.authService.getUserFromAuthenticationRefreshToken(getCodeDto.code);
        if (refreshedUser) {
            if (refreshedUser.status !== UserStatus.AWAY) {
                return { result: 'token-connected' };
            }
            return { result: 'token-ok' };
        }
        else {
            const user = await this.authService.getUserById(Number(id));
            await this.authService.updateUser({
                    status: UserStatus.AWAY
                }
                , user);
            await this.authService.removeRefreshToken(user);
            return { result: 'token-ko' };
        }
    }

    @Get('/logout')
    @UseGuards(JwtGuard)
    async removeRefreshToken(@GetUser() user: User) {
        await this.authService.removeRefreshToken(user);
    }

    @Get('/users')
    @UseGuards(JwtGuard)
    async getAllUsers() {
        return await this.authService.getAllUsers();
    }

    @Get('/users/all/:id')
    @UseGuards(JwtGuard)
    async getAllUsersForMe(@Param('id') id: string) {
        return await this.authService.getAllUsersForMe(Number(id));
    }

    @Patch('/user')
    @UseGuards(JwtGuard)
    async updateUser(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
        return await this.authService.updateUser(updateUserDto, user);
    }

    @Get('/user/:id')
    @UseGuards(JwtGuard)
    getUserById(@Param('id') id: string) {
        return this.authService.getUserById(Number(id));
    }

    @Patch('/user/:id')
    @UseGuards(JwtGuard)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.authService.update(updateUserDto, Number(id));
    }

    @Get('/users/friends')
    @UseGuards(JwtGuard)
    getAllUserFriends(@GetUser() user: User) {
        return this.authService.getAllUserFriends(user);
    }

    @Get('/users/channels')
    @UseGuards(JwtGuard)
    getAllUserChannels(@GetUser() user: User) {
        return this.authService.getAllUserChannels(user);
    }

    @Get('/users/privatechannels')
    @UseGuards(JwtGuard)
    getAllUserMemberChannels(@GetUser() user: User) {
        return this.authService.getAllUserMemberChannels(user);
    }

    @Get('/users/games')
    @UseGuards(JwtGuard)
    getAllUserGames(@GetUser() user: User) {
        return this.authService.getAllUserGames(user);
    }
    
    @Get('/users/games-won')
    @UseGuards(JwtGuard)
    async getAllUsersGamesWon() {
        return await this.authService.getAllUsersGamesWon();
    }

    @Get('/user/rank/:id')
    @UseGuards(JwtGuard)
    getUserRank(@Param('id') id: string) {
        return this.authService.getUserRank(Number(id));
    }
}
