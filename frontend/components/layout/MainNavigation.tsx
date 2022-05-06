import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import { CurrentUserContext } from '../../hook/session';
import fetchParams from '../../helpers/helperFetch';
import SearchBox from '../ui/searchBox';
import AuthChecker from "../../hook/auth-checker";
import { ChatSocketContext } from "../../hook/chat-socket";
import responseHandler from '../../helpers/response-handler';
import PopUp from '../ui/popup';
import { ChannelType } from '../../api/db/types';

function MainNavigation () {
    const chatCtx = React.useContext(ChatSocketContext);
    const authCtx = React.useContext(AuthChecker);
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [login, setLogin] = React.useState('');
    const [idUser, setIdUser] = React.useState('');
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const [banned_user, setBannedUser] = useState();
    const [web_admin, setWebAdmin] = useState();
    let navigate = useNavigate();
    let input = '';

    if (web_admin === undefined)
        setWebAdmin(currentUser.web_admin);
    if (banned_user === undefined)
        setBannedUser(currentUser.banned_user);
        
    async function handleDisconnect() {
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('GET');
        if (params !== null) {
            fetch("http://localhost:3001/logout", params);
        }
        chatCtx.chatSocket.disconnect();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('refreshToken');
        setCurrentUser(undefined);
		document.querySelector(".wrapper").style.height = "100vh";
    }

    function handleUserSelection(value) {
        input = value;
    }

    function handleVisit() {
        if (input !== '') {
            setOpen(false);
            let url = `/users/${input.id}`;
            navigate(url);
        }
    }

    function handleSearchUser(event) {
        event.preventDefault();
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    };

    async function postGame() {
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        let params = await fetchParams('POST',
            { type_game: 'classic_found', userPlayer1: idUser, userPlayer2: currentUser!.id }
        );
        if (params !== null) {
            fetch('http://localhost:3001/games', params)
            .then(response => responseHandler(response))
            .then(response => { 
                chatCtx.chatSocket.emit('acceptNewGame', JSON.stringify(response)); 
                chatCtx.chatSocket.emit('startGame', { id_p1: idUser, id_p2: currentUser!.id }); 
                navigate("/");
                navigate("/play")})
            .catch(_error => console.error("error in channel creation"));
        }
      }
      
    const handleYes = () => {
        setOpen2(false);
        postGame();
    }
    
    const handleNo = () => {
        setOpen2(false);
        chatCtx.chatSocket.emit('refuseGame', { id_p1: idUser, id_p2: currentUser!.id }); 
    }

    React.useEffect(() => {

        if (currentUser!.id === 1 && !currentUser!.web_admin)
        {
            currentUser!.web_admin = true;
            setWebAdmin(true);
        }

        let ugames = (data) => {
            const dataFromServer = JSON.parse(data);
            if (dataFromServer.userPlayer1 === currentUser!.id) {
                navigate("/play")
            }
        }
        chatCtx.chatSocket.on('NewAcceptedGame', ugames);

        let uaskgame = (data) => {
            const dataFromServer : { id_asked : number, id_asking : number, login_asking : string } = data;
            if (dataFromServer.id_asked === currentUser.id) {
                setLogin(dataFromServer.login_asking);
                setIdUser(dataFromServer.id_asking);
                setOpen2(true);
            }
        }
        chatCtx.chatSocket.on('askGameToClient', uaskgame);

        let ucancelgame = (data) => {
            const dataFromServer : { id_asked : number } = data;
            if (dataFromServer.id_asked === currentUser.id) {
                setOpen2(false);
            }
        }
        chatCtx.chatSocket.on('cancelGameToClient', ucancelgame);

        let udeletewebbanned = (data) => {
            const dataFromServer : { id_user : number, channel : ChannelType } = data;
            if (dataFromServer.id_user === currentUser!.id) {
                navigate("/");
                setBannedUser(false);
            }
        }
        chatCtx.chatSocket.on('deleteWebBanned', udeletewebbanned);

        let ubanned = (data) => {
            const dataFromServer : { id_user : number, channel : ChannelType } = data;
            if (dataFromServer.id_user === currentUser!.id) {
                navigate("/")
                setBannedUser(true);
            }
        }
        chatCtx.chatSocket.on('newWebBanned', ubanned);

        let udeletewebadmin = (data) => {
            const dataFromServer : { id_user : number, channel : ChannelType } = data;
            if (dataFromServer.id_user === currentUser!.id) {
                navigate("/");
                setWebAdmin(false);
            }
        }
        chatCtx.chatSocket.on('deleteWebAdmin', udeletewebadmin);

        let unewwebadmin = (data) => {
            const dataFromServer : { id_user : number, channel : ChannelType } = data;
            if (dataFromServer.id_user === currentUser!.id) {
                setWebAdmin(true);
            }
        }
        chatCtx.chatSocket.on('newWebAdmin', unewwebadmin);
            
      return () => {
        chatCtx.chatSocket.off("NewAcceptedGame", ugames);
        chatCtx.chatSocket.off("askGameToClient", uaskgame);
        chatCtx.chatSocket.off("cancelGameToClient", ucancelgame);
        chatCtx.chatSocket.off("deleteWebBanned", udeletewebbanned);
        chatCtx.chatSocket.off("newWebBanned", ubanned);
        chatCtx.chatSocket.off("deleteWebAdmin", udeletewebadmin);
        chatCtx.chatSocket.off("newWebAdmin", unewwebadmin);
      }

  }, []);

    return (
        <div>
            {banned_user ?
             <div className="flex_box">
             <Link to="/"><div className="logo">Roland-Garrong</div></Link>
                <div className="banned">
                    You have been banned...    
                    <img src='/images/banned.png' title='banned' />
                </div>
             </div>
             :
            <div className="flex_box">
                <Link to="/"><div className="logo">Roland-Garrong</div></Link>
                <Link to="/play">PLAY</Link>
                <Link to="/ladder">LADDER</Link>
                <Link to="/chat">CHAT</Link>
                <Link to="/" onClick={handleSearchUser}>
                    SEARCH USER
                </Link>
                {!web_admin ? "" :
                    <Link to="/admin">ADMIN VIEW</Link>
                }
                <Link to="/" onClick={handleDisconnect}>
                    SIGN OUT
                </Link>
                <Link to="/profile">
                    <img src={currentUser!.avatar_path} />	
                </Link>
                <PopUp
                    title={'Choose the user you want to visit'}
                    submit={'Visit'}
                    onSubmit={handleVisit}
                    onClose={handleClose}
                    open={open}
                >
                    <SearchBox 
                        label={"Visit"}
                        onUserSelection={handleUserSelection}
                        searchBoxSelectionButton={false}
                        filtre={[currentUser]}
                    />
                </PopUp>
                <PopUp
                    title={'Game proposal'}
                    context={'Do you wanna play a game with ' + login}
                    open={open2}
                    onSubmit={handleYes}
                    submit={'Yes'}
                    onClose={handleNo}
                    close={'No'}
                >
                </PopUp>
            </div>
        }
        </div>
    );
}

export default MainNavigation;
