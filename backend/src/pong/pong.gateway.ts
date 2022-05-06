import {
	SubscribeMessage,
		WebSocketGateway,
		OnGatewayInit,
		WebSocketServer,
		OnGatewayConnection,
		OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PongService } from './pong.service';
import { UsersService } from './pong.service';

const clients = new Map();

function onePlayer(game) {
	if (game['type_game'] === 'classic_search' || game['type_game'] === 'fast_search')
		return true;
	return false;
}

@WebSocketGateway({
	namespace: '/pong',
  	cors: {
    	origin: '*',
  	},
})

	export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

		@WebSocketServer() server: Server;

	    constructor(
		        private pongService: PongService,
		        private usersService: UsersService
		 ) {}

		private logger: Logger = new Logger('PongGateway');

		@SubscribeMessage('msgToServer')
			handleMessage(client: Socket, payload: string): void {
				this.server.emit('msgToClient', payload);
			}

		@SubscribeMessage('updatePos')
			handlePosUpdate(client: Socket, data: {gameId: string, paddle1Vh: number, paddle2Vh: number, score1: number, score2: number, powerCount1: number, powerCount2: number}) {
				this.server.to(data.gameId).emit('pos', {gameId: data.gameId, paddle1Vh: data.paddle1Vh, paddle2Vh: data.paddle2Vh, score1: data.score1, score2: data.score2, powerCount1: data.powerCount1, powerCount2: data.powerCount2});
			}

		@SubscribeMessage('endGame')
			handleMessageGameEnded(client: Socket) {
				this.server.emit("end", clients.get(client.id));
			}

		@SubscribeMessage('serve')
			handleMessageServe(client: Socket, data: {gameId: string, score1: number, score2: number, playerWin: number}) {
				this.server.to(data.gameId).emit('gameBegins', {score1: data.score1, score2: data.score2, playerWin: data.playerWin});
			}

		@SubscribeMessage('paddle1Collision')
			handleCollisionPaddle1(client: Socket, data: {gameId: string, ballTopVh: number, ballLeftVw: number, speed: string}) {
				this.server.to(data.gameId).emit('collisionPaddle1', {ballTopVh: data.ballTopVh, ballLeftVw: data.ballLeftVw, speed: data.speed});
			}

		@SubscribeMessage('paddle2Collision')
			handleCollisionPaddle2(client: Socket, data: {gameId: string, ballTopVh: number, ballLeftVw: number, speed: string}) {
				this.server.to(data.gameId).emit('collisionPaddle2', {ballTopVh: data.ballTopVh, ballLeftVw: data.ballLeftVw, speed: data.speed});
			}

		@SubscribeMessage('topCollision')
			handleCollisionTop(client: Socket, data: {gameId: string, ballTopVh: number, ballLeftVw: number}) {
				this.server.to(data.gameId).emit('ballCollisionTop', {ballTopVh: data.ballTopVh, ballLeftVw: data.ballLeftVw});
			}

		@SubscribeMessage('bottomCollision')
			handleCollisionBootom(client: Socket, data: {gameId: string, ballTopVh: number, ballLeftVw: number}) {
				this.server.to(data.gameId).emit('ballCollisionBottom', {ballTopVh: data.ballTopVh, ballLeftVw: data.ballLeftVw});
			}

		@SubscribeMessage('handleLag')
			handleLagHandle(client: Socket, data: {gameId: string, ballTopVh: number, ballLeftVw: number}) {
				this.server.to(data.gameId).emit('lagFrame', {ballTopVh: data.ballTopVh, ballLeftVw: data.ballLeftVw});
			}

		@SubscribeMessage('paddle1UpdateUp')
			handleUpdatePaddle1Up(client: Socket, gameId: string) {
				this.server.to(gameId).emit('movePaddle1Up');
			}

		@SubscribeMessage('paddle1UpdateDown')
			handleUpdatePaddle1Down(client: Socket, gameId: string) {
				this.server.to(gameId).emit('movePaddle1Down');
		}

		@SubscribeMessage('paddle2UpdateUp')
			handleUpdatePaddle2Up(client: Socket, gameId: string) {
				this.server.to(gameId).emit('movePaddle2Up');
			}

		@SubscribeMessage('paddle2UpdateDown')
			handleUpdatePaddle2Down(client: Socket, gameId: string) {
				this.server.to(gameId).emit('movePaddle2Down');
		}

		@SubscribeMessage('createRoom')
			async handleRoom(client: Socket, data: {gameId: string, user1Id: number, user2Id: number}){
				const game = await this.pongService.getGame(data.gameId);
				const user1 = await this.usersService.getUser(data.user1Id);
				const user2 = await this.usersService.getUser(data.user2Id);
				this.server.emit('newGame', {gameId: data.gameId, user1: user1, user2: user2, type_game: game.type_game});
			}

		@SubscribeMessage('gameCalculations')
  			async handleCalculations(client: Socket, data: {gameId: string, user1Id: number, user2Id: number, dxd: number, dyd: number}) {
			this.server.to(data.gameId).emit('move', {gameId: data.gameId, user1: data.user1Id, user2: data.user2Id, dxd: data.dxd, dyd: data.dyd});
  		}

	  	@SubscribeMessage('joinRoom')
  			handleRoomJoin(client: Socket, data: {gameId: string, user1Id: number, user2Id: number}) {
    		client.join(data.gameId);
  		}

		afterInit(server: Server) {
		}	

	  	@SubscribeMessage('cancelSearchOpponent')
		async cancel(client: Socket) {
			if (clients.get(client.id) != undefined) {
				const user = await this.usersService.getUser(clients.get(client.id));
				const games = await this.usersService.getGames(user)
				.then(games => games)	
				.then(games => games.filter(onePlayer))
				.then(function(games) {
						return games;
				})
				if (games.length != 0)
					await this.pongService.deleteGame(games[0].id); 
			}
		}

		async handleDisconnect(client: Socket) {
			this.server.emit("disconnected", clients.get(client.id));
			if (clients.get(client.id) != undefined) {
				const user = await this.usersService.getUser(clients.get(client.id));
				const games = await this.usersService.getGames(user)
				.then(games => games)	
				.then(games => games.filter(onePlayer))
				.then(function(games) {
						return games;
				})
				if (games.length != 0) {
					await this.pongService.deleteGame(games[0].id); 
				}
			}
			clients.delete(client.id);
			client.disconnect(true);
		}

		async handleConnection(client: Socket, ...args: any[]) {
			try {
     			const user = await this.usersService.getUserFromSocket(client);
    		} catch (e) {
      			this.logger.log(`${e}`);
      			client.disconnect();
    		}
			this.server.emit('connection');
		}

		@SubscribeMessage('addUser')
			handleUserAdd(client: Socket, userId: number) {
				clients.set(client.id, userId);
			}

		@SubscribeMessage('ongoingGames')
			handleGamesOngoing(client: Socket)  {
				this.server.emit('showOngoingGames');
			}
	}
