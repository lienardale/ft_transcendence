import { Injectable } from '@nestjs/common';
import { GamesService } from 'src/games/games.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from '../auth/entities/user.entity';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
	export class UsersService {
		constructor(
			private authService: AuthService
		) {}
	
		async getUser(userId) {
			return await this.authService.getUserById(userId);
		}

		async getGames(user: User) {
			return await this.authService.getAllUserGames(user);
		}

		async getUserFromSocket(socket: Socket) : Promise<User> {
    		const token: string = socket.handshake.auth.token;
    		if (token === undefined) { 
      			throw new WsException("Invalid credentials");
    		}
    		const user = await this.authService.getUserFromAuthenticationToken(token);
    		if (!user) {
      			throw new WsException("Invalid credentials");
    		}
    		return user;
  		}
};

@Injectable()
	export class PongService {
		constructor(
				private gameService: GamesService
				) {}

		async deleteGame(id_game: number) {
			await this.gameService.remove(id_game);
		}

		async getGames() {
			return await this.gameService.findAll();
		}

		async getGame(gameId) {
			return await this.gameService.findOne(gameId);
		}
	};
