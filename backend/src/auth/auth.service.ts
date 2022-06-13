import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './helpers/jwtPayload.interface';
import { User } from './entities/user.entity';
import { UserFull } from './entities/userFull.entity';
import { Game } from '../games/entities/game.entity';
import { Repository, getConnection } from 'typeorm';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AxiosRequestConfig } from 'node_modules/axios';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as bcrypt from 'bcrypt';
import { UpsertType } from 'typeorm/driver/types/UpsertType';

@Injectable()
export class AuthService {
    constructor (
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private httpService: HttpService,
    ) {}

    async getTokenFrom42(code: string): Promise<string> {
        const requestConfig: AxiosRequestConfig = {
            params: {
                'grant_type': 'authorization_code',
                'client_id': process.env.API42_CLIENT_ID,
                'client_secret': process.env.API42_SECRET,
                'code': code,
                'redirect_uri': process.env.REDIRECT_URI,
            },
        };

        return lastValueFrom(
            await this.httpService.post('https://api.intra.42.fr/oauth/token', null, requestConfig).pipe(
              map((response) => response.data.access_token),
            ),
        );
    }

    async retrieveUserFrom42(access_token: string): Promise<string> {
        const requestConfig: AxiosRequestConfig = {
            headers: {
               'Authorization': 'Bearer '+ access_token,
            },
        };

        const email42 = lastValueFrom(
            await this.httpService.get('https://api.intra.42.fr/v2/me', requestConfig).pipe(
              map((response) => response.data.email),
            ),
        );
        return email42;
    }

    async api42Login(email: string) : Promise<User> {
        let user = await this.userRepository.findOne({ email });
        if (!user) {
            const newUser = this.userRepository.create({
                email,
            });
            try {
                user = await this.userRepository.save(newUser);
            } catch (error) {
                if (error.code === '23505') {
                    throw new ConflictException('User already exists');
                } else {
                    throw new InternalServerErrorException();
                }
            }
        }
        return user;
    }

    async turnOn2FA(userId: number) {
        await this.userRepository.update(
            userId, 
            { level2factor_auth: 'true' } 
        );
        const updatedUser: User = await this.userRepository.findOne(userId);
        return updatedUser;
    }

    async turnOff2FA(userId: number) {
        await this.userRepository.update(
            userId, 
            { level2factor_auth: 'false' } 
        );
        const updatedUser: User = await this.userRepository.findOne(userId);
        return updatedUser;
    }

    async set2FASecret(secret: string, userId: number): Promise<User> {
        await this.userRepository.update( 
            userId, 
            { level2factor_secret: secret } 
        );
        const updatedUser: User = await this.userRepository.findOne(userId);
        return updatedUser;
    }

    async getAccessToken(user: User, twoFAisAuthenticated: boolean = false) {
        const { id } = user;
        const payload: JwtPayload = { id, twoFAisAuthenticated };
        const accessToken: string = await this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_ACCESS,
            expiresIn: 14400,
        });
        return accessToken;
    }

    async getRefreshToken(user: User, twoFAisAuthenticated: boolean = false) {
        const { id } = user;
        const payload: JwtPayload = { id, twoFAisAuthenticated };
        const refreshToken: string = await this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_REFRESH,
            expiresIn: 604800,
        });
        return refreshToken;
    }

    async setCurrentRefreshToken(refreshToken: string, userId: number) {
        const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userRepository.update(userId, {
            currentHashedRefreshToken
        });
    }

    async removeRefreshToken(user: User) {
        return await this.userRepository.update(user.id, {
            currentHashedRefreshToken: null
        });
    }

    async getAllUsers() {
        return await this.userRepository.find({ order: {id :"ASC"}});
    }

    async getAllUsersForMe(userId: number) {
        
        const allBlockedForMe = await getConnection()
        .createQueryBuilder()
        .select("user.id")
        .addSelect("CASE WHEN userBlocking.userBlockingId = " + userId + " THEN 1 ELSE 0 END isBlocked")
        .from(User, "user")
        .leftJoin("user.userBlocking", "userBlocking")
        .groupBy("user.id")
        .addGroupBy("CASE WHEN userBlocking.userBlockingId = " + userId + "  THEN 1 ELSE 0 END")
        ;

        const allLoginsForMe = await getConnection()
        .createQueryBuilder()
        .select("user")
        .addSelect("blocked.isblocked")
        .from(User, "user")
        .leftJoinAndSelect("(" + allBlockedForMe.getQuery() + ")", "blocked", "blocked.user_id = user.id")
        .orderBy("user.id")
        .setParameters(allBlockedForMe.getParameters())
        .getRawMany();
        ;
        
        const object = allLoginsForMe.map((s: any) => {
                const item : UserFull = {
                    id: s.user_id,
                    status : s.user_status,
                    level : s.user_level,
                    level2factor_auth : s.user_level2factor_auth,
                    email : s.user_email,
                    login : s.user_login,
                    avatar_path : s.user_avatar_path,
                    avatar : s.user_avatar,
                    banned_user : s.user_banned_user,
                    web_admin : s.user_web_admin,
                    isBlockedByMe : s.isblocked
                };
                return item;
            });
      
      return object;

    }

    async updateUser(updateUserDto: UpdateUserDto, user: User) {
        await this.userRepository.update(user.id, updateUserDto)
        .catch(_err => {throw new HttpException('Error in update User', HttpStatus.CONFLICT)})
        const updatedUser = await this.userRepository.findOne(user.id);
        if (updatedUser) {
            return updatedUser
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async update(updateUserDto: UpdateUserDto, id: number) {
        const updatedUser = await this.userRepository.findOne(id);
        await this.userRepository.update(id, updateUserDto);
        if (updatedUser) {
            return updatedUser
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    async getUserById(id: number) {
        if (!id)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const user = await this.userRepository.findOne(id);
        if (user) {
            return user;
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.getUserById(userId);
        const isRefreshTokenMatching = await bcrypt.compare(
            refreshToken,
            user.currentHashedRefreshToken
        );
        if (isRefreshTokenMatching) {
            return user;
        }
    }

    async getAllUserFriends(user: User) {
        const { email } = user;
        const existingUser = await this.userRepository.findOne({ email }, { relations: ['friendsAsked', 'friendsAsking'] });
        if (existingUser) {
            return existingUser.friendsAsked.concat(existingUser.friendsAsking);
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async getAllUserChannels(user: User) {
        const { email } = user;
        const existingUser = await this.userRepository.findOne({ email }, { relations: ['channels'] });
        if (existingUser) {
            return existingUser.channels;
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async getAllUserMemberChannels(user: User) {
        // to do : avoir tous les channels dont le user est membre
        const { email } = user;
        const existingUser = await this.userRepository.findOne({ email }, { relations: ['channels'] });
        if (existingUser) {
            return existingUser.channels;
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async getAllUserGames(user: User) {
        const { email } = user;
        const existingUser = await this.userRepository.findOne({ email }, { relations: ['gamesP1', 'gamesP2'] });
        if (existingUser) {
            return existingUser.gamesP1.concat(existingUser.gamesP2);
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async getAllUsersGamesWon() {
        const gameP1 = await getConnection()
        .createQueryBuilder()
        .select("user.id")
        .addSelect("user.login")
        .addSelect("user.email")
        .addSelect("user.status")
        .addSelect("user.avatar_path")
        .addSelect("user.avatar")
        .addSelect("COUNT(gamesP1.id) AS nbwin")
        .addSelect("RANK () OVER (ORDER BY COUNT(gamesP1.id) DESC) AS rank")
        .from(User, "user")
        .leftJoin(Game, "gamesP1", "gamesP1.userPlayer1.id = user.id")
        .groupBy("user.id")
        .addGroupBy("user.login")
        .addGroupBy("user.email")
        .addGroupBy("user.status")
        .addGroupBy("user.avatar_path")
        .addGroupBy("user.avatar")
        .orderBy("COUNT(gamesP1.id)", "DESC")
        ;
        return (gameP1.getRawMany())
    }
    
    async getUserRank(id: number) {
        const tab = await this.getAllUsersGamesWon();
        
        const check = tab.find(elem => elem.user_id === id);
        if (check !== undefined) {
            return (check.rank)
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    public async getUserFromAuthenticationToken(token: string): Promise<User> {
       let payload: JwtPayload;
       try {
            payload = await this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET_ACCESS
            });
            return this.userRepository.findOne(payload.id);
        } catch(error) {
            return null;
        }
    }
    
    public async getUserFromAuthenticationRefreshToken(token: string): Promise<User> {
       let payload: JwtPayload;
       try {
            payload = await this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET_REFRESH
            });
            return await this.userRepository.findOne(payload.id);
        } catch(error) {
            return null;
        }
    }
}
