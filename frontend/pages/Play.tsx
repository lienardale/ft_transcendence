import React from "react";
import Body from '../components/body';
import openSocket from 'socket.io-client';
import { CurrentUserContext } from '../hook/session';
import { useNavigate } from "react-router-dom";
import AuthChecker from "../hook/auth-checker";
import io from "socket.io-client";
import ReactDOM from 'react-dom';
import { ChatSocketContext } from "../hook/chat-socket";
import fetchGet from '../helpers/fetchGet';
import fetchPost from '../helpers/fetchPost';
import fetchPatch from '../helpers/fetchPatch';
import fetchDelete from '../helpers/fetchDelete';

function Play() {
	var close_sock = false;
	var new_page = false;
	const navigate = useNavigate();
	const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
	const accessToken = localStorage.getItem('currentUser');
	const socket = io('wss://roland-garrong.fr/pong', { 
		auth: { token: accessToken, id_user: currentUser.id }, 
		secure: true,
		withCredentials: true, 
		transports: ['websocket'],
		path:"/roland-sockets",
	});
	const chatCtx = React.useContext(ChatSocketContext);
	const authCtx = React.useContext(AuthChecker);
	const delay = ms => new Promise(res => setTimeout(res, ms));
	let playing = false;
	let type_game: string;
	var ongoing_games;
	let paddle_1;
	let paddle_2;
	let field;
	let initial_ball;
	let ball;
	let score_1;
	let score_2;
	let message;
	let paddle_1_coord;
	let paddle_2_coord;
	let initial_ball_coord;
	let ball_coord;
	let field_coord;
	let paddle_1_top;
	let paddle_2_top;
	let paddle_1_top_vh;
	let paddle_2_top_vh;
	let ball_top_vh;
	let ball_left_vw;
	let score1;
	let score2;
	let gameState
	let type;
	let dx;
	let dy;
	let dxd;
	let dyd;
	let disconnect;
	let frame;
	let switchU;
	let power_count_1;
	let power_count_2;
	let player_win_id;
	let data_g = {gameId: null, user1: 0, user2: 0};
	const [controller, setController] = React.useState(new AbortController());

	async function fromChatMatch() {
		await authCtx.authCheck(localStorage.getItem(currentUser));
		let ret: {};
    	if ((ret = await fetchGet('/api/games', controller)) === undefined)
			return ;
		let games = ret.filter(isOngoing);
		games.forEach(function(element) {
			if (currentUser === undefined)
				return ;
			if (element.userPlayer1.id === currentUser.id || element.userPlayer2.id === currentUser.id) {
				type_game = "classic";
				socket.emit('addUser', currentUser.id);
				let data = { gameId: element.id, user1: element.userPlayer1, user2: element.userPlayer2, type_game: element.type_game};
				socket.emit('joinRoom', data);
				startGame(data);
			}
		});
	}

	let previousUrl = '/play';
	const config = {subtree: true, childList: true};
	
	function vh(v) {
			var h = window.innerHeight;
			return (100 * v) / h;
	}

	function vw(v) {
		var w = window.innerWidth;
		return (100 * v) / w;
	}

	const observer = new MutationObserver(function(mutations) {
			if (location.pathname !== previousUrl) {
				close_sock = true;
				new_page = true;
				playing = false;
				gameState = "start";
				socket.emit('endGame');
				const refreshToken = localStorage.getItem('refreshToken');
				const accessToken = localStorage.getItem('currentUser');
				if (refreshToken !== null && accessToken !== null) {
					document.querySelector(".flex_box").style.display = "flex";
				}
			}
	});

	observer.observe(document, config);

	React.useEffect(() => {	
		field_coord = document.querySelector('.field').getBoundingClientRect();
		paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
		paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();
		new_page = false;

	socket.off('newGame').on('newGame', (data) => {
			if (data.user1.id === currentUser.id || data.user2.id === currentUser.id) {
				socket.emit('joinRoom', data)
				startGame(data);
			}	
	});
		
	socket.off('move').on('move', (data) => {
		dxd = data.dxd;
		dyd = data.dyd;
		gameState = 'play';
		ball_coord = document.querySelector('.ball').getBoundingClientRect();
		ball_top_vh = vh(ball_coord.top);
		ball_left_vw = vw(ball_coord.left);
		document.querySelector('.message').innerHTML = '';
		requestAnimationFrame(() => {
			moveBall();
		});
	});

	socket.off('gameBegins').on('gameBegins', (scores) => {
			gameState = 'start';
			score1 = scores.score1;
			score2 = scores.score2;
			document.querySelector('.player_1_score').innerHTML = score1;
			document.querySelector('.player_2_score').innerHTML = score2;
			document.querySelector('.ball').style.top = '46vh';
			document.querySelector('.ball').style.left = '46vw';
			ball_coord = document.querySelector('.ball').getBoundingClientRect();
			ball_top_vh = 46;
			ball_left_vw = 46;	
			if (score2 === 7 || score1 === 7) {
				gameState = 'start';
				playing = false;
				document.querySelector('.message').style.fontSize = "xx-large";
				if (currentUser.id == data_g.user1.id)
					gameWon(data_g.gameId, score1, score2, data_g.user1.id, data_g.user2.id);
				if (score2 === 7 && currentUser.id === data_g.user2.id)
					document.querySelector('.message').innerHTML = 'YOU WON!!!';
				else if (score1 === 7 && currentUser.id === data_g.user1.id)
					document.querySelector('.message').innerHTML = 'YOU WON!!!';
				else if (score2 === 7 || score1 === 7 && currentUser.id === data_g.user2.id)
					document.querySelector('.message').innerHTML = 'YOU LOST...';
				if (data_g.user1.id != currentUser.id && data_g.user2.id != currentUser.id) {
					if (score2 === 7)
						document.querySelector('.message').innerHTML = "WINNER: " + data_g.user2.login;
					else if (score1 === 7)
						document.querySelector('.message').innerHTML = "WINNER: " + data_g.user1.login;
				}	
				return ;
			}
			if (!data_g.type_game.includes("classic")) {
				if (power_count_1 === 100) {
					document.querySelector(".power1").style.background = "";
					document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px red";
					power_count_1 = 0;
				}
				if (power_count_2 === 100) {
					document.querySelector(".power2").style.background = "";
					document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px red";
					power_count_2 = 0;
				}
				if (scores.playerWin !== data_g.user1.id) {
					document.querySelector(".power1").style.background = "";
					power_count_1 = 0;
				} else {
					document.querySelector(".power2").style.background = "";
					power_count_2 = 0;
				}
			}
			begins();
		});

		socket.off('movePaddle1Up').on('movePaddle1Up', () => {
			if (currentUser.id === data_g.user1.id)
				return ;
			paddle_1_top = Math.max(field_coord.top, paddle_1_coord.top - window.innerHeight * 0.04);
			paddle_1_top_vh = vh(paddle_1_top);
			document.querySelector('.paddle_1').style.top = paddle_1_top + 'px';
			paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
		});

		socket.off('movePaddle1Down').on('movePaddle1Down', () => {
			if (currentUser.id === data_g.user1.id)
				return ;
			paddle_1_top = Math.min(field_coord.bottom - paddle_1_coord.height, paddle_1_coord.top + window.innerHeight * 0.04);
			paddle_1_top_vh = vh(paddle_1_top);
			document.querySelector('.paddle_1').style.top = paddle_1_top + 'px';
			paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
		});

		socket.off('movePaddle2Up').on('movePaddle2Up', () => {
			if (currentUser.id === data_g.user2.id)
				return ;
			paddle_2_top = Math.max(field_coord.top, paddle_2_coord.top - window.innerHeight * 0.04);
			paddle_2_top_vh = vh(paddle_2_top);
			document.querySelector('.paddle_2').style.top = paddle_2_top + 'px';
			paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();
		});

		socket.off('movePaddle2Down').on('movePaddle2Down', () => {
			if (currentUser.id === data_g.user2.id)
				return ;
			paddle_2_top = Math.min(field_coord.bottom - paddle_2_coord.height, paddle_2_coord.top + window.innerHeight * 0.04);
			paddle_2_top_vh = vh(paddle_2_top);
			document.querySelector('.paddle_2').style.top = paddle_2_top + 'px';
			paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();
		});

		socket.off('collisionPaddle1').on('collisionPaddle1', (data) => {
			dxd = 1;
			if (data.speed === "slow") {
				shake1();
			}	
			let speed_ball = (data_g.type_game.includes("classic")) ? 0.3 : 0.4;
			ballPosUpdate(data);
			if (!data_g.type_game.includes("classic")) {
				if (power_count_2 === 100) {
					document.querySelector(".power2").style.background = "";
					power_count_2 = 0;
				}
				if (data.speed === "slow")
					document.querySelector(".ball_effect").style.boxShadow = "0px 0px 0px 0px red";
				else
					document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px red";
				power_count_1 = (data.speed === "normal") ? power_count_1+25 : 0;
				document.querySelector(".power1").style.background = "linear-gradient(to bottom, aliceblue " + (100 - power_count_1) + "%, #1260CE " + (100 - power_count_1) + "%, red " +  power_count_1 + "%)";
			}
			if (power_count_1 === 100 && !data_g.type_game.includes("classic")) {
				dx = speed_ball + 0.2;
				document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px #1260CE";
				dy = dx;
			} else {
				dx = (data.speed === "normal") ? speed_ball : speed_ball - 0.1;
				dy = dx;
			}
		});

		socket.off('collisionPaddle2').on('collisionPaddle2', (data) => {
			dxd = 0;
			if (data.speed === "slow") {
				shake2();
			}	
			let speed_ball = (data_g.type_game.includes("classic")) ? 0.3 : 0.4;
			ballPosUpdate(data);
			if (!data_g.type_game.includes("classic")) {
				if (power_count_1 === 100) {
					document.querySelector(".power1").style.background = "";
					power_count_1 = 0;
				}
				if (data.speed === "slow")
					document.querySelector(".ball_effect").style.boxShadow = "0px 0px 0px 0px red";
				else
					document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px red";
				power_count_2 = (data.speed === "normal") ? power_count_2+25 : 0;
				document.querySelector(".power2").style.background = "linear-gradient(to bottom, aliceblue " + (100 - power_count_2) + "%, #1260CE " + (100 - power_count_2) + "%, red " + power_count_2 + "%)";
			}
			if (power_count_2 === 100 && !data_g.type_game.includes("classic")) {
				dx = speed_ball + 0.2;
				document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px #1260CE";
				dy = dx;
			} else {
				dx = (data.speed === "normal") ? speed_ball : speed_ball - 0.1;
				dy = dx;
			}
		});

		socket.off('ballCollisionTop').on('ballCollisionTop', (data) => {
			ballPosUpdate(data);
			dyd = 1;
		});

		socket.off('ballCollisionBottom').on('ballCollisionBottom', (data) => {
			ballPosUpdate(data);
			dyd = 0;
		});

		socket.off('lagFrame').on('lagFrame', (data) => {
			ballPosUpdate(data);
		});

		socket.off('end').on('end', (userId) => {
			if (currentUser.id === userId) {
				disconnect = 1;	
				playing = false;
				gameState = 'start';
			}
		});

		socket.off('disconnected').on('disconnected', (userId) => {
			if (playing === false) {
				return ;
			}
			if (userId === data_g.user1.id) {
				score2 = 7;
				document.querySelector('.player_2_score').innerHTML = score2;
			}
			else if (userId === data_g.user2.id) {
				score1 = 7;
				document.querySelector('.player_1_score').innerHTML = score1;
			}
			else
				return ;
			disconnect = 1;	
			playing = false;
			gameState = 'start';
			document.querySelector('.message').style.fontSize = "xx-large";
			if (data_g.user1.id != currentUser.id && data_g.user2.id != currentUser.id) {
				if (score1 === 7)
					document.querySelector('.message').innerHTML = "WINNER: " + data_g.user1.login + " (other player disconnected...)";
				else
					document.querySelector('.message').innerHTML = "WINNER: " + data_g.user2.login + " (other player disconnected...)";
				return ;
			}
			gameWon(data_g.gameId, score1, score2, data_g.user1.id, data_g.user2.id);
			document.querySelector('.message').innerHTML = 'YOU WON!!! (other player disconnected...)';
		});

		socket.off('pos').on('pos', (data) => {
			if (currentUser.id === data_g.user1.id || currentUser.id === data_g.user2.id)
				return ;
			paddle_1_top_vh = data.paddle1Vh;
			paddle_2_top_vh = data.paddle2Vh;
			document.querySelector('.paddle_1').style.top = data.paddle1Vh + "vh";
			document.querySelector('.paddle_2').style.top = data.paddle2Vh + "vh";
			score1 = data.score1;
			score2 = data.score2;
			document.querySelector('.player_1_score').innerHTML = score1;
			document.querySelector('.player_2_score').innerHTML = score2;
			power_count_1 = data.powerCount1;
			power_count_2 = data.powerCount2;
			document.querySelector(".power1").style.background = "linear-gradient(to bottom, aliceblue " + (100 - power_count_1) + "%, #1260CE " + (100 - power_count_1) + "%, red " +  power_count_1 + "%)";
			document.querySelector(".power2").style.background = "linear-gradient(to bottom, aliceblue " + (100 - power_count_2) + "%, #1260CE " + (100 - power_count_2) + "%, red " +  power_count_2 + "%)";
			document.querySelector(".ball").style.visibility = "visible";
			resizeGame();
		});

		socket.off('showOngoingGames').on('showOngoingGames', () => {
			gamesShown();
		});

		gamesShown();

		window.onresize = resizeGame;

		document.addEventListener('keydown', movePaddle);
		document.addEventListener('visibilitychange', handleTabChanged);

		fromChatMatch();

     return () => {
		socket.disconnect();
		document.removeEventListener('keydown', movePaddle);
	 	document.removeEventListener('visibilitychange', handleTabChanged);
		new_page = true;
		chatCtx.chatSocket.emit('connect user', { id_user: currentUser!.id });
	 }
	}, []);	

	async function shake1() {
		document.querySelector(".paddle_1").style.animation = "shake 0.42s cubic-bezier(.36,.07,.19,.97) both infinite";
		await delay(420);
		document.querySelector(".paddle_1").style.animation = "";
	}

	async function shake2() {
		document.querySelector(".paddle_2").style.animation = "shake 0.42s cubic-bezier(.36,.07,.19,.97) both infinite";
		await delay(420);
		document.querySelector(".paddle_2").style.animation = "";
	}

	function ballPosUpdate(data) {
		document.querySelector(".ball").style.top =  data.ballTopVh + "vh";
		document.querySelector(".ball").style.left =  data.ballLeftVw + "vw";
		ball_coord = document.querySelector('.ball').getBoundingClientRect();
		ball_top_vh = data.ballTopVh;
		ball_left_vw = data.ballLeftVw;
	}

	async function begins() {
			frame = 0;
			switchU = 2;
			dx = (data_g.type_game.includes("classic")) ? 0.3 : 0.4;
			dy = dx;
			if (document.querySelector('.message').innerHTML === "Game will start...") {
				if (data_g.user1.id == currentUser.id)
					socket.emit('ongoingGames');
			}
			await delay(1000);
			if (currentUser.id === data_g.user1.id)
				socket.emit('updatePos', {gameId: data_g.gameId, paddle1Vh: paddle_1_top_vh, paddle2Vh: paddle_2_top_vh, score1: score1, score2: score2, powerCount1: power_count_1, powerCount2: power_count_2});
			if (disconnect === 1 || new_page === true)
				return ;
			dxd = (score1 + score2) % 2 === 0 ? 1 : 0;
			dyd = score1 % 2;
			if (dxd === 1) {
				document.querySelector(".arrow").style.WebkitTransform = "rotate(-45deg)";
				document.querySelector(".arrow").style.left = "54%";
			} else {
				document.querySelector(".arrow").style.WebkitTransform = "rotate(135deg)";
				document.querySelector(".arrow").style.left = "46%";
			}
			document.querySelector(".arrow").style.display = "block";
			document.querySelector('.message').innerHTML = "3";
			document.querySelector('.message').style.fontSize = "21vh";
			await delay(1000);
			if (disconnect === 1 || new_page === true)
				return ;
			document.querySelector('.message').innerHTML = "2";
			await delay(1000);
			if (disconnect === 1 || new_page === true)
				return ;
			document.querySelector('.message').innerHTML = "1";
			await delay(1000);
			gameState = 'play';
			if (disconnect === 1 || new_page === true)
				return ;
			document.querySelector(".arrow").style.display = "none";
			document.querySelector('.paddle_1').style.filter = "";
			document.querySelector('.paddle_2').style.filter = "";
			if (currentUser.id === data_g.user1.id)
				socket.emit('updatePos', {gameId: data_g.gameId, paddle1Vh: paddle_1_top_vh, paddle2Vh: paddle_2_top_vh, score1: score1, score2: score2, powerCount1: power_count_1, powerCount2: power_count_2});
			if (gameState === 'play' && currentUser.id === data_g.user1.id && disconnect === 0 && playing === true) {
				socket.emit('gameCalculations', {gameId: data_g.gameId, user1Id: data_g.user1.id, user2Id: data_g.user2.id, dxd: dxd, dyd: dyd});
			}
		}

	function moveBall() {
			frame = (frame === 25) ? frame = 0 : frame+=1;
			switchU = (switchU === 2) ? switchU = 0 : switchU= 2;
			if (disconnect === 1 || gameState === 'start') {
				return ;
			}
			if (dyd === 0 && currentUser.id === data_g.user1.id && ball_coord.top <= field_coord.top) {
				socket.emit('topCollision', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw});
			}
			if (dyd === 1 && currentUser.id === data_g.user2.id && ball_coord.bottom >= field_coord.bottom) {
				socket.emit('bottomCollision', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw});
			}
			if (dxd === 0 && currentUser.id === data_g.user1.id && ball_coord.left <= (paddle_1_coord.right - (paddle_1_coord.width / 2)) && ball_coord.top >= paddle_1_coord.top &&
					ball_coord.bottom <= (paddle_1_coord.bottom)) {
				if (ball_coord.top > (paddle_1_coord.top + (paddle_1_coord.height / 4)))
					socket.emit('paddle1Collision', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw, speed: "slow"});
				else
					socket.emit('paddle1Collision', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw, speed: "normal"});
			}
			if (dxd === 1 && currentUser.id === data_g.user2.id && ball_coord.right >= (paddle_2_coord.left + (paddle_2_coord.width / 2)) && ball_coord.top >= paddle_2_coord.top &&
					ball_coord.bottom <= (paddle_2_coord.bottom)) {
				if (ball_coord.top > (paddle_2_coord.top + (paddle_2_coord.height / 4)))
					socket.emit('paddle2Collision', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw, speed: "slow"});
				else
					socket.emit('paddle2Collision', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw, speed: "normal"});
			}
			if (ball_coord.left <= field_coord.left || ball_coord.right >= field_coord.right) {
				if (currentUser.id === data_g.user1.id) {
					if (ball_coord.left <= field_coord.left) {
						player_win_id = data_g.user2.id;
						score2++;
					} else {
						player_win_id = data_g.user1.id;
						score1++;
					}
				}
				if (currentUser.id === data_g.user1.id && gameState === 'play' && playing === true)
					socket.emit('serve', {gameId: data_g.gameId, score1: score1, score2: score2, playerWin: player_win_id});
				return;
			}
			document.querySelector('.ball').style.setProperty('top', `calc(${ball_top_vh}vh + ${dy * (dyd == 0 ? -1 : 1)}vh)`);
			document.querySelector('.ball').style.setProperty('left', `calc(${ball_left_vw}vw + ${dx * (dxd == 0 ? -1 : 1)}vw)`);
			ball_coord = document.querySelector('.ball').getBoundingClientRect();
			ball_top_vh = vh(ball_coord.top);
			ball_left_vw = vw(ball_coord.left);
			if (frame === 25 && currentUser.id === data_g.user1.id && switchU % 2 === 0)
				socket.emit('handleLag', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw});
			else if (frame === 25 &&currentUser.id === data_g.user2.id)
				socket.emit('handleLag', {gameId: data_g.gameId, ballTopVh: ball_top_vh, ballLeftVw: ball_left_vw});
			requestAnimationFrame(() => {
				moveBall();
			});
		};

		const movePaddle = (e) => {	
			if (currentUser.id === data_g.user1.id && e.key == 'ArrowUp') {
				paddle_1_top = Math.max(field_coord.top, paddle_1_coord.top - window.innerHeight * 0.04);
				paddle_1_top_vh = vh(paddle_1_top);
				document.querySelector('.paddle_1').style.top = paddle_1_top + 'px';
				paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
				socket.emit('paddle1UpdateUp', data_g.gameId);
			}
			else if (currentUser.id === data_g.user1.id && e.key == 'ArrowDown') {
				paddle_1_top = Math.min(field_coord.bottom - paddle_1_coord.height, paddle_1_coord.top + window.innerHeight * 0.04);
				paddle_1_top_vh = vh(paddle_1_top);
				document.querySelector('.paddle_1').style.top = paddle_1_top + 'px';
				paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
				socket.emit('paddle1UpdateDown', data_g.gameId);
			}
			else if (currentUser.id === data_g.user2.id && e.key == 'ArrowUp') {
				paddle_2_top = Math.max(field_coord.top, paddle_2_coord.top - window.innerHeight * 0.04);
				paddle_2_top_vh = vh(paddle_2_top);
				document.querySelector('.paddle_2').style.top = paddle_2_top + 'px';
				paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();
				socket.emit('paddle2UpdateUp', data_g.gameId);
			}
			else if (currentUser.id === data_g.user2.id && e.key == 'ArrowDown') {
				paddle_2_top = Math.min(field_coord.bottom - paddle_2_coord.height, paddle_2_coord.top + window.innerHeight * 0.04);
				paddle_2_top_vh = vh(paddle_2_top);
				document.querySelector('.paddle_2').style.top = paddle_2_top + 'px';
				paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();
				socket.emit('paddle2UpdateDown', data_g.gameId);
			}
		};

		const handleTabChanged = (e) => {	
			if (document.visibilityState !== "visible") {
				disconnect = 1;
				playing = false;
				close_sock = true;
				if (currentUser.id === data_g.user1.id) {
					score2 = 7;
					document.querySelector('.player_2_score').innerHTML = score2;
				}
				else {
					score1 = 7;
					document.querySelector('.player_1_score').innerHTML = score1;
				}
				document.querySelector('.message').style.fontSize = "xx-large";
				document.querySelector('.message').innerHTML = "You've been disconnected...";
				socket.emit('endGame');
				socket.disconnect();
				socket.connect();
				chatCtx.chatSocket.emit('connect user', { id_user: currentUser!.id });
			}
		};

		function resizeGame() {
			if (new_page === true) {
				return ;
			}
			document.querySelector('.ball').style.top = ball_top_vh + 'vh';
			document.querySelector('.ball').style.left = ball_left_vw + 'vw';
			ball_coord = document.querySelector('.ball').getBoundingClientRect();
			document.querySelector('.paddle_1').style.top = paddle_1_top_vh + 'vh';
			document.querySelector('.paddle_2').style.top = paddle_2_top_vh + 'vh';
			paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
			paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();
			field_coord = document.querySelector('.field').getBoundingClientRect();
		}

		async function gameWon(gameId, score_player_1, score_player_2, userPlayer_1, userPlayer_2) {
			let requestOptionsGame;
			if (score_player_1 > score_player_2) {
				requestOptionsGame = { type_game: type + '_mode', score_player1: score_player_1, score_player2: score_player_2 };
			} else {	
				requestOptionsGame = { type_game: type + '_mode', score_player1: score_player_2, score_player2: score_player_1, userPlayer1: userPlayer_2, userPlayer2: userPlayer_1};
			}
			await authCtx.authCheck(localStorage.getItem(currentUser));
			let ret: {};
    		if ((ret = await fetchPatch('/api/games/' + gameId, requestOptionsGame)) === undefined)
				return ;
			socket.emit('ongoingGames');
		}

	function startGame(data) {	
		data_g = data;
		close_sock = true;
		playing = true;
		searchEnded();	
		document.querySelector("body").style.overflowY = "hidden";
		document.querySelector("body").style.overflowX = "hidden";
		document.querySelector(".flex_box").style.display = "none";
		document.querySelector(".wrapper").style.alignItems = "center";
		document.querySelector(".play").style.display = "none";
		document.querySelector(".waiting").style.display = "none";
		document.querySelector(".game").style.display = "block";
		document.querySelector("#player1").textContent = data.user1.login;
		document.querySelector("#player2").textContent = data.user2.login;
		document.querySelector(".power1").style.display = "block";
		document.querySelector(".power2").style.display = "block";
		document.querySelector(".power1").style.background = "aliceblue";
		document.querySelector(".power2").style.background = "aliceblue";
		document.querySelector(".wrapper").style.height = "100vh";
		document.querySelector(".ball_effect").style.boxShadow = "2px 2px 2px 2px red";
		game(data);
	};

	async function game(data) {
		score1 = 0
		score2 = 0
		gameState = 'start';
		type = (data.type_game.includes("classic")) ? "classic" : "fast";
		dx = (data.type_game.includes("classic")) ? 0.3 : 0.4;
		dy = (data.type_game.includes("classic")) ? 0.3 : 0.4;
		dxd = 1;
		dyd = 0;
		disconnect = 0;
		power_count_1 = 0;
		power_count_2 = 0;

		document.querySelector(".paddle_1").style.top = "45vh";
		document.querySelector(".paddle_2").style.top = "45vh";
		document.querySelector(".ball").style.top = "46vh";
		document.querySelector(".ball").style.left = "46vw";

		field_coord = document.querySelector('.field').getBoundingClientRect();
		paddle_1_coord = document.querySelector('.paddle_1').getBoundingClientRect();
		paddle_2_coord = document.querySelector('.paddle_2').getBoundingClientRect();

		if (data.type_game.includes("classic")) {
			document.querySelector(".power1").style.display = "none";
			document.querySelector(".power2").style.display = "none";
			document.querySelector(".ball_effect").style.display = "none";
		}
		
		if (currentUser.id === data.user1.id)
			document.querySelector('.paddle_1').style.filter = "drop-shadow(yellow 0px 0px 0.75rem)";
		else if (currentUser.id === data.user2.id)
			document.querySelector('.paddle_2').style.filter = "drop-shadow(yellow 0px 0px 0.75rem)";

		if (currentUser.id != data.user1.id && currentUser.id != data.user2.id) {
			document.querySelector('.message').innerHTML = "connecting to the game...";
			document.querySelector(".ball").style.visibility = "hidden";
			document.querySelector('.message').fontSize = "xx-large";
		}
		await delay(3000);
		if (currentUser.id === data.user1.id)
			socket.emit('serve', {gameId: data.gameId, score1: score1, score2: score2, playerWin: -1});
	};

	function handleEndGame(e) {	
		e.preventDefault();
		playing = false;
		close_sock = true;
		document.querySelector(".paddle_1").style.top = "45vh";
		document.querySelector('.paddle_1').style.filter = "";
		document.querySelector(".paddle_2").style.top = "45vh";
		document.querySelector('.paddle_2').style.filter = "";
		document.querySelector(".ball").style.top = "46vh";
		document.querySelector(".ball").style.left = "46vw";
		document.querySelector(".message").innerHTML = "Game will start...";
		document.querySelector(".message").style.fontSize = "xx-large";
		document.querySelector(".ball_effect").style.display = "block";
		document.querySelector(".arrow").style.display = "none";

		document.querySelector("body").style.overflowY = "visible";
		document.querySelector("body").style.overflowX = "visible";
		document.querySelector(".flex_box").style.display = "flex";
		document.querySelector(".wrapper").style.alignItems = "";
		document.querySelector(".play").style.display = "flex";
		document.querySelector(".game").style.display = "none";
		document.querySelector('.player_1_score').innerHTML = 0;
		document.querySelector('.player_2_score').innerHTML = 0;
		document.querySelector(".wrapper").style.height = "calc(100vh - 67px)";
		socket.emit('endGame');
		socket.disconnect();
		socket.connect();
		chatCtx.chatSocket.emit('connect user', { id_user: currentUser!.id });
	}

	function searchOpponent() {
		socket.emit('addUser', currentUser.id);
		var games = getWaitingGames()
			.then(function(response) {
					
					return response;
			})
		games
			.then(games => games)
			.then(async function(games) {
					if (games.length === 0) {
						await authCtx.authCheck(localStorage.getItem(currentUser));
						let ret: {};
   	 					if ((ret = await fetchPost('/api/games', { type_game: type_game + '_search', userPlayer1: currentUser }) === undefined))
							return ;
						chatCtx.chatSocket.emit('searchGame', { id_user: currentUser!.id });
					} else if (games[0].userPlayer1.id != currentUser.id) {
						await authCtx.authCheck(localStorage.getItem(currentUser));
						let ret: {};
   	 					if ((ret = await fetchPatch('/api/games/' + games[0].id, { type_game: type_game + '_found', userPlayer2: currentUser }) === undefined))
							return ;
						chatCtx.chatSocket.emit('startGame', { id_p1: currentUser!.id, id_p2: games[0].userPlayer1.id });
						socket.emit('createRoom', { gameId: games[0].id, user1Id: games[0].userPlayer1.id, user2Id: currentUser.id});
					}
			})
	};

	function isWaiting(game) {
		if (game['type_game'] === (type_game + '_search')) {
			return true;
		}
		return false;
	}

	function isOngoing(game) {
		if (game['type_game'].includes("found")) {
			return true;
		}
		return false;
	}

	async function getWaitingGames() {
		await authCtx.authCheck(localStorage.getItem(currentUser));
		let ret: {};
    	if ((ret = await fetchGet('/api/games', controller)) === undefined)
			return ;
		let games = ret.filter(isWaiting);
		return games;
	}

	function closeSocket(e) {
		e.preventDefault();
		close_sock = true;
		document.querySelector(".play").style.display = "flex";
		socket.emit('cancelSearchOpponent');
		chatCtx.chatSocket.emit('cancelSearchGame', { id_user: currentUser!.id })
	}	

	function searchEnded() {
		if (new_page === true) {
			socket.emit('cancelSearchOpponent');
			return ;
		}
		document.querySelector(".waiting").style.display = "none";
		document.getElementById("b1").style.visibility = "hidden";
		document.getElementById("b2").style.visibility = "hidden";
		document.getElementById("b3").style.visibility = "hidden";
		document.querySelector(".button_garrong_exit").style.visibility = "hidden";
	}

	const waiting = async () => {
		close_sock = false;
		document.querySelector(".waiting").style.display = "flex";
		document.querySelector(".play").style.display = "none";
		document.querySelector(".button_garrong_exit").style.visibility = "visible";
		while (true) {
			if (close_sock === true) {
				searchEnded();
				break ;
			}
			if (new_page === false)
				document.getElementById("b1").style.visibility = "visible";
			await delay(600);
			if (close_sock === true) {
				searchEnded();
				break ;
			}
			if (new_page === false)
				document.getElementById("b2").style.visibility = "visible";
			await delay(600);
			if (close_sock === true) {
				searchEnded();
				break ;
			}
			if (new_page === false)
				document.getElementById("b3").style.visibility = "visible";
			await delay(600);
			if (close_sock === true) {
				searchEnded();
				break ;
			}
			if (new_page === false) {
				document.getElementById("b1").style.visibility = "hidden";
				document.getElementById("b2").style.visibility = "hidden";
				document.getElementById("b3").style.visibility = "hidden";
			}
			await delay(600);
		}
		close_sock = false;
	};

	function handleClassic(e) {	
		e.preventDefault();
		waiting();
		type_game = "classic";
		searchOpponent();
	}

	function handleFast(e) {	
		e.preventDefault();
		waiting();
		type_game = "fast";
		searchOpponent();
	}

	function handleWatch(id, user1, user2, type_game) {
		let data = { gameId: id, user1: user1, user2: user2, type_game: type_game};
		socket.emit('joinRoom', data);
		startGame(data);
	}

	async function getOngoingGames() {
		await authCtx.authCheck(localStorage.getItem(currentUser));
		let ret: {};
    	if ((ret = await fetchGet('/api/games', controller)) === undefined)
			return ;
		let games = ret.filter(isOngoing);
		const list = games.map((word, idx) => 
		<div key={idx} className="game_card">
			<p>{word.userPlayer1.login}</p>
			<p>VS</p>
			<p>{word.userPlayer2.login}</p>
			<a href="#" onClick={() => handleWatch(word.id, word.userPlayer1, word.userPlayer2, word.type_game)}>
			<button className="button_garrong watch">watch</button>
			</a>
		</div>
		);
		return list;
	}

	function gamesShown() {
		if (new_page === true) {
			return ;
		}
		ongoing_games = getOngoingGames()
			.then(function(ongoing_games) {
				ReactDOM.render(
	  				<div>{ongoing_games}</div>, document.querySelector(".list_games")
				);
			})
	}

	return(
 	<Body content={
	<div>
		<div className="game">
			<div className="power1"></div>
			<div className="players">
			<div id="player1">
				player1
			</div>
			<div id="score">
				<div className="player_1_score">0</div>
				-
				<div className="player_2_score">0</div>
			</div>
			<div id="player2">
				player2
			</div>
			<div className="power2"></div>
			</div>
			<div className="field">
				<div className="arrow"></div>
				<div className='ball'>
					<div className="ball_effect"></div>
				</div>
				<div className="paddle_1 paddle"></div>
				<div className="paddle_2 paddle"></div>
				<h1 className="message">
					Game will start...
				</h1>
			</div>
			<div className="button_garrong_end">
		  		<a href="#" onClick={handleEndGame}>
					<button className="button_garrong"> End game</button>
		  		</a>
			</div>
		</div>
		<div className="play">
		<div className="left_launch">
			<div className="launch">
				<h1>Launch a game</h1>
				<div className="modes_box">
					<div className="button_garrong_play" className="classic">
						<p>Classic Mode</p>
		  				<a href="#" onClick={handleClassic}>
							<button className="button_garrong">Play</button>
		  				</a>
					</div>
					<div className="sep"></div>
					<div className="button_garrong_play" className="fast">
						<p>Fast Mode</p>
		  				<a href="#" onClick={handleFast}>
							<button className="button_garrong">Play</button>
		  				</a>
					</div>
				</div>
			</div>
			<div className="rules_card">
				<div className="rules">
					<p>Rules:</p>
					<ul>
						<li>first player to 7 points wins the game</li>
						<li>fast mode: don't be affraid of the ball's speed! (the color blue will be your nighmare)</li>
					</ul>
				</div>
				<div className="controls">
					<p>Controls:</p>
					<ul>
						<li>move your racket with up and down arrows</li>
						<li>tips: your racket's position on reception will impact the speed of the ball!</li>
					</ul>
				</div>
			</div>
			</div>
			<div className="ongoing">
				<h1>Ongoing games</h1>
				<div className="list_games">
				</div>
			</div>
		</div>
		<div className="waiting">
			<div className="wait_ball">
				<div className="ball_garrong" id="b1"></div>
				<div className="ball_garrong" id="b2"></div>
				<div className="ball_garrong" id="b3"></div>
			</div>
			<div className="button_garrong_exit">
		  		<a href="#" onClick={closeSocket}>
					<button className="button_garrong">Cancel</button>
				</a>
			</div>
		</div>
	</div>
	}
	/>
 )
}

export default Play;
