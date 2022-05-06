import React, { useState } from 'react';
import { useParams} from "react-router-dom";
import { UserType, AskList, FriendItem, BlockList, Game } from '../../api/db/types';
import Body from "../../components/body";
import FriendStatus from '../../components/friends/FriendStatus';
import { CurrentUserContext } from '../../hook/session';
import { ChatSocketContext } from "../../hook/chat-socket";
import AuthChecker from "../../hook/auth-checker";
import responseHandler from "../../helpers/response-handler";
import fetchParams from '../../helpers/helperFetch';
import GameList from "../../components/games/GameList";
import GameStats from "../../components/games/GameStats";
import { useNavigate } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const [loadedUser, setLoadedUser] = useState<UserType | undefined>(undefined);
  const authCtx = React.useContext(AuthChecker);
  const chatCtx = React.useContext(ChatSocketContext);
  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const [controller, setController] = React.useState(new AbortController());
  const [friends, setFriends] = useState<FriendItem[] | undefined>(undefined);
  const [asked, setAsked] = useState<AskList[] | undefined>(undefined);
  const [asking, setAsking] = useState<AskList[] | undefined>(undefined);
  const [blocked, setBlocked] = useState<BlockList[]>();
  const [games, setGames] = useState<Game[] | null>(null);

  const [rank, setRank] = React.useState();
  const [error, setError] = useState<Boolean>(false);
  const [mounted, setMounted] = React.useState<Boolean>(true);

  async function getfirstLoadedUser() {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET', id);
    if (params !== null) {
        await fetch(
          'http://localhost:3001/user/' + id, {...params,
          signal: controller.signal
        })
          .then(response => responseHandler(response))
          .then((data) => {
            if (mounted === true){
              setLoadedUser(data);
              setError(false)
            }
          })
          .catch((_error) => {
            setError(true)
            setMounted(false)
          });
      }
  }
  
  async function checkUserId(){
    let test_id :boolean = false;
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch("http://localhost:3001/users", {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then(users => {
          let test = users.filter((user : UserType)  => {
            return user.id === Number(id)
          })
          if (test.length !== 0){
            test_id = true;
            if (mounted === true)
              setError(false)
          }
          else {
            if (mounted === true)
              setError(true)
            test_id = false;
          }
        }
      )
      .catch(_error => {
      });
    }
    return test_id;
  }

  async function firstRender() {
    let test_id :boolean = await checkUserId()
    if (test_id !== false){
      await getfirstLoadedUser();
      await getListFriends();
      await getListAskingFriends();
      await getListAskedFriends();
      await getListBlocked();
      await getListGames();
      await getUserRank();
    }
  }

  async function getUserRank() {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET', id);
    if (params !== null) {
      await fetch("http://localhost:3001/user/rank/" + id, {...params,
      signal: controller.signal
    })
        .then(response => responseHandler(response))
        .then((rank) => {
          if (mounted === true)
            setRank(rank)
        })
        .catch((_error) => {setError(true)});
      } 
  }

  async function getListFriends(){
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch('http://localhost:3001/friends-list/friends/' + currentUser!.id, {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        if (mounted === true)
          setFriends(data);
      })
      .catch(_error => {});
    }
  }

  async function getListAskingFriends(){
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch('http://localhost:3001/friends-list/friends-asking/' + currentUser!.id, {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        if (mounted === true)
          setAsking(data);
      })
      .catch(_error => {});
    }
  }

  async function getListAskedFriends(){
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch('http://localhost:3001/friends-list/friends-asked/' + currentUser!.id, {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        if (mounted === true)
          setAsked(data);
      })
      .catch(_error => {});
    }
  }

  async function getListBlocked(){
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch('http://localhost:3001/blocked-list/blocked/' + currentUser!.id, {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        if (mounted === true)
          setBlocked(data)
      })
      .catch(_error => {});
    }
  }

  async function getListGames(){
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch('http://localhost:3001/games', {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        let all_games : Game[] = data;
        let mygames : Game[] | undefined = all_games.filter( x =>
          x.userPlayer1.id === parseInt(id, 10) ||
          x.userPlayer2.id === parseInt(id, 10)
        )
        mygames.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
        if (mounted === true)
          setGames(mygames)
      })
      .catch(_error => {});
    }
  }
    
  React.useEffect(()=>{
    if (isNaN(id) === true){
      setError(true)
      return () => {
        setMounted(false)
        chatCtx.chatSocket.off("majAvatar", uavatar);
        chatCtx.chatSocket.off("majLogins", ulogin);
        chatCtx.chatSocket.off("newFriendRequestToClient", ufriend);
      }
    }
    setMounted(true);
    firstRender();
    let ufriend = (data) => {
      const dataFromServer : { id_user_asking : number , id_user_asked : number } = data;
      if (dataFromServer.id_user_asked === currentUser!.id || dataFromServer.id_user_asking === currentUser!.id) {
        getListFriends();
        getListAskingFriends();
        getListAskedFriends();
        getListBlocked();
        getListGames();
        getUserRank();
      }
    }
    chatCtx.chatSocket.on('newFriendRequestToClient', ufriend)

    let ulogin = (data : number) => {
      const dataFromServer : number = data;
      if (dataFromServer === Number(id)){
        firstRender();
      }
    }
    chatCtx.chatSocket.on('majLogins', ulogin)

    let uavatar =  (data : number) => {
      const dataFromServer : number = data;
      if (dataFromServer === Number(id)){
        firstRender();
      }
    }
    chatCtx.chatSocket.on('majAvatar', uavatar)

    return () => {
      setMounted(false)
      chatCtx.chatSocket.off("majAvatar", uavatar);
      chatCtx.chatSocket.off("majLogins", ulogin);
      chatCtx.chatSocket.off("newFriendRequestToClient", ufriend);
    }
  }, [id]);

  function handleFriendRequest(id : number){
    chatCtx.chatSocket.emit('newFriendRequestToServer', { id_user_asking : currentUser!.id , id_user_asked: id });
  }

  if (loadedUser){
    return (
      <Body
        content={
        <div className="user_profile">
          <div className="user_infos">
            <div className="user_infos_avatar">
              <div className="avatar_medium">
                <img src={loadedUser!.avatar_path || '/images/default_user.jpg'} alt="profile picture" layout="fill" />
              </div>
            </div>
            <div className="user_infos_login">
              <div className="login">
                Login : {loadedUser!.login}
              </div>
            </div>
            <div className="avatar_small">
              {loadedUser!.status === 'CONNECTED' ? 
                <img src='/images/connected.png' title='connected' /> : <area></area> }
              {loadedUser!.status === 'GAMING' ? 
                <img src='/images/playing.png' title='playing' /> : <area></area> }
              {loadedUser!.status === 'SEARCHING' ? 
                <img src='/images/searching.png' title='searching for a game' /> : <area></area> }
              {loadedUser!.status === 'AWAY' ? 
                <img src='/images/away.png' title='away' /> : <area></area> }
            </div>
            {loadedUser!.id !== currentUser!.id ?
              <div className={"actions"}>
                <FriendStatus
                  onFriendRequest={handleFriendRequest}
                  loadedUser={loadedUser}
                  id={id}
                  friends={friends}
                  asked={asked}
                  asking={asking}
                  blocked={blocked}
                />
              </div>
              :
              <div></div>
            }
          </div>
          < GameList items={games}/>
          <div className="user_stats">
            < GameStats 
                user={loadedUser}
                items={games}
                rank={rank}
              />
            </div>
          </div>
      }/>
    );
  }
  else if (error !== false){
    return (
      <Body content={
        <div>
          <h1>
              User '{id}' does not exist.
          </h1>
        </div>
      }/>
    )
  }
  else {
    return (
      <Body
        content={
            <div>
                <h1>
                    Loading...
                </h1>
            </div>
          }
      />
    );
  }
}

export default UserProfile;