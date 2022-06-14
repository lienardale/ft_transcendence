import React, { useState, useRef } from "react";
import Body from "../components/body";
import { Game, FriendItem, AskList as Requests, BlockList, UserType, Window } from '../api/db/types';
import { CurrentUserContext } from '../hook/session';
import fetchParams from "../helpers/helperFetch";
import GameList from "../components/games/GameList";
import FriendList from "../components/friends/FriendList";
import BlockedList from "../components/blocked/BlockedList";
import AskList from "../components/friends/AskList";
import responseHandler from "../helpers/response-handler";
import AuthChecker from "../hook/auth-checker";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { ChatSocketContext } from "../hook/chat-socket";
import GameStats from "../components/games/GameStats";
import classes from '../styles/components/buttons.module.css'

function Profile() {

  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const chatCtx = React.useContext(ChatSocketContext);
  const authCtx = React.useContext(AuthChecker);
  const [qrCodeUrl, setQrCodeUrl] = useState();
  const inputCodeRef = useRef();
  const [twoFAEnabled, setTwoFAEnabled] = useState(currentUser!.level2factor_auth);
  const [credsAreWrong, setCredsAreWrong] = useState();

  const [newLogin, setNewLogin] = useState<string>('');

  const inputLoginRef = useRef();

  const [image, setImage] = useState<File>(null);
  const [createObjectURL, setCreateObjectURL] = useState('');

  const [avatar, setAvatar]= useState(currentUser!.avatar_path);

  const [friends, setFriends] = useState<FriendItem[] | undefined>(undefined);
  const [asked, setAsked] = useState<Requests[] | undefined>(undefined);
  const [asking, setAsking] = useState<Requests[] | undefined>(undefined);
  const [blocked, setBlocked] = useState<BlockList[]>();
  const [games, setGames] = useState<Game[] | null>(null);

  const [rank, setRank] = React.useState();

  const [controller, setController] = React.useState(new AbortController());

  const [mounted, setMounted] = React.useState<Boolean>(true);

  const [errors, setErrors] = React.useState<string | null>(null);
  const [displayQr, setDisplayQR] = useState<Boolean>(false)

  async function turnOn2FAHandler(event) {
    event.preventDefault();
    const code = inputCodeRef.current.value;
    if (code.length === 0) { 
      if (mounted === true)
        setCredsAreWrong(true);
      return ;
    }
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('POST', { code });
    if (params !== null) {
      fetch("/api/2fa/turn-on", {...params,
        signal: controller.signal
      })
      .then(response => responseHandler(response))
      .then((data) => {
        if (mounted === true){
          setTwoFAEnabled("true");
          setCredsAreWrong(false);
        }
        const { updatedUser, accessToken, refreshToken } = data;
        localStorage.setItem("currentUser", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        if (mounted === true)
          setCurrentUser(updatedUser);
      })
      .catch(_error => {
        if (mounted === true)
          setCredsAreWrong(true); 
      });
    }
  }

  async function turnOff2FAHandler(event) {
    event.preventDefault();

    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const code = inputCodeRef.current.value;
    if (code.length === 0) {
      if (mounted === true) 
        setCredsAreWrong(true);
      return ;
    }
    const params = await fetchParams('POST', { code });
    if (params !== null) {
      fetch("/api/2fa/turn-off", {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        if (mounted === true){
          setTwoFAEnabled("false");
          setCredsAreWrong(false);
        }
        const { updatedUser, accessToken, refreshToken } = data;
        localStorage.setItem("currentUser", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        if (mounted === true)
          setCurrentUser(updatedUser);
      })
      .catch(_error => {
        if (mounted === true)
          setCredsAreWrong(true); 
      });
    }
  }

  async function generate2FAHandler(event) {
    event.preventDefault();
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('POST', {});
    if (params !== null && displayQr !== true && twoFAEnabled !== "true") {
      fetch("/api/2fa/generate-qrcode", {...params,
      signal: controller.signal
    })
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        return response.blob().then(data => {
          throw new Error(data.message || 'Something went wrong!');
        });
      })
      .then((qrCode) => {
        const imageUrl = URL.createObjectURL(qrCode);
        if (mounted === true){
          setDisplayQR(true);
          setQrCodeUrl(imageUrl);
        }
      })
      .catch(_error => {
        // console.error("error in QR code generation")
      });
    }
    else{
      if (mounted === true){
        setDisplayQR(false);
        setQrCodeUrl('');
      }
    }
  }

async function check_logins(input_login : string){
  let test_login :boolean = false;
  if (input_login.length > 20 || input_login.length < 1){
    if (mounted === true)
      setErrors('wrong login size, must be <1 or >21')
    return test_login;
  }
  await authCtx.authCheck(localStorage.getItem("currentUser"));
  const params = await fetchParams('GET');
  if (params !== null) {
    await fetch("/api/users", {...params,
      signal: controller.signal
    })
    .then(response => responseHandler(response))
    .then(users => {
        let test = users.filter((user : UserType)  => {
          return user.login === input_login
        })
        if (test.length === 0){
          test_login = true;
          if (mounted === true)
            setErrors(null)
        }
        else {
          if (mounted === true)
            setErrors('login already taken, choose another')
          test_login = false;
        }
      }
    )
    .catch(_error => {});
  }
  return test_login;
}

  async function modifyLogin(event){
    event.preventDefault();

    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const login : string = inputLoginRef.current.value;
    let test_login :boolean = await check_logins(login);

    const params = await fetchParams('PATCH', { login });
    if (test_login !== false && params !== null) {
      await fetch("/api/user", {...params,
      signal: controller.signal
    })
      .then(response => {
        if (response.ok){
          responseHandler(response).then((data) => {
            if (mounted === true){
              setNewLogin(login);
              setCurrentUser(data);
              setErrors(null);
              chatCtx.chatSocket.emit('majPMServer', { id_user: currentUser!.id });
              chatCtx.chatSocket.emit('majLoginsServer', { id_user: currentUser!.id });
              console.log('majLoginsServer sent to back ', currentUser!.id)
            }
          })
        }
        else{
          if (mounted === true)
            setErrors('login already taken, choose another');
        }
      })
      .catch(_error => {});
    }
  }

  async function uploadToDB(avatar_path : string) {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('PATCH', { avatar_path });
    if (params !== null) {
      return await fetch("/api/user", {...params,
      signal: controller.signal
    })
      .then(response => {
        if (response.ok){
          responseHandler(response).then((data) => {
            if (mounted === true){
              setCreateObjectURL(avatar_path);
              setCurrentUser(data);
			  setAvatar(avatar_path)
              setErrors(null);
              chatCtx.chatSocket.emit('majAvatarServer', { id_user: currentUser!.id });
            }
        })}
        else{
          if (mounted === true)
            setErrors('there is a problem with your avatar, choose another');
        }
      })
      .catch(error => {});
    }
  }

  async function check_avatar(body : FormData){
    let check :boolean = false;
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      try{
        const params2 = {
          method: "POST", 
          body 
        }
        await fetch("/avatar_api/check",{...params2,
          signal: controller.signal
        }).then(response => {
        if (response.ok) {
          check = true;
        }
        else
          throw(response)
      })
      }catch(error) {setErrors('there is a problem with your avatar, choose another')};
    }
    return check;
  }

	const uploadToServer = async (event : any) => {
		const body = new FormData();
		body.append("upload_preset", "avatar")
		body.append("file", image!);
		body.append("cloudName", "rolandgarong")
		body.append("sources", "[ 'local', 'url', 'image_search']")
		body.append("resourceType", "image")
		body.append("multiple", "false")
		body.append("maxImageFileSize" , "5000000")
	
	
		let check : boolean = await check_avatar(body);
		if (check === false){
		  if (mounted === true)
			setErrors('there is a problem with your avatar, choose another');
		  return ;
		}
		await authCtx.authCheck(localStorage.getItem("currentUser"));
		const params = await fetchParams('GET');
		if (params !== null) {
		  const params2 = {
			method: "POST",
			body: body
		  }
		  try {
		  const res  = await fetch("https://api.cloudinary.com/v1_1/rolandgarong/image/upload", {...params2,
			signal: controller.signal
		  })
		  if (res.status === 200){
				const resp = await res.json();
				let n_av = resp.secure_url;
				uploadToDB(n_av);
			}
			else{
			  if (mounted === true)
				setErrors('there is a problem with your avatar, choose another');
			  }
			}
			catch(e){}
		}
  };

	const uploadToClient = (event : any) => {
	  if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size < 1 || event.target.files[0].size > 5000000){
        if (mounted === true)
          setErrors('file too big, max 5Mb')
        return ;
      }
      const i = event.target.files[0];
      if (mounted === true){
        setImage(i);
        setCreateObjectURL(URL.createObjectURL(i));
      }
	  }
	};

  async function firstRender() {
    getListFriends()
    getListAskingFriends()
    getListAskedFriends()
    getListBlocked()
    getListGames()
    getUserRank()
  }

  async function getUserRank() {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch("/api/user/rank/" + currentUser!.id, {...params,
        signal: controller.signal
      })
      .then(response => responseHandler(response))
      .then(rank => {
        if (mounted === true)
          setRank(rank)
      })
      .catch(_error => {});
    } 
  }

  async function getListFriends(){
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch('/api/friends-list/friends/' + currentUser!.id, {...params,
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
      await fetch('/api/friends-list/friends-asking/' + currentUser!.id, {...params,
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
      await fetch('/api/friends-list/friends-asked/' + currentUser!.id, {...params,
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
      await fetch('/api/blocked-list/blocked/' + currentUser!.id, {...params,
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
      await fetch('/api/games', {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then((data) => {
        let all_games : Game[] = data;
        let mygames : Game[] = all_games.filter( x =>
          x.userPlayer1.id === currentUser!.id ||
          x.userPlayer2.id === currentUser!.id
        )
        mygames.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
        if (mounted === true){
          setGames(mygames)
        }
      })
      .catch(_error => {});
    }
  }

  React.useEffect(()=>{
    firstRender();
    let ufriend = (data) => {
      const dataFromServer : { id_user_asking : number , id_user_asked : number } = data;
      if (dataFromServer.id_user_asked === currentUser!.id || dataFromServer.id_user_asking === currentUser!.id) {
        firstRender();
      }
    }
    chatCtx.chatSocket.on('newFriendRequestToClient', ufriend)

    let ulogin = () => {
        firstRender();
    }
    chatCtx.chatSocket.on('majLogins', ulogin)

    let uavatar = () => {
        firstRender();
    }
    chatCtx.chatSocket.on('majAvatar', uavatar)

    return () => {
      setMounted(false)
      chatCtx.chatSocket.off("majAvatar", uavatar);
      chatCtx.chatSocket.off("majLogins", ulogin);
      chatCtx.chatSocket.off("newFriendRequestToClient", ufriend);
      controller?.abort()
    }
  }, []);
  
  function handleFriendRequest(id : number){
    chatCtx.chatSocket.emit('newFriendRequestToServer', { id_user_asking : currentUser!.id , id_user_asked: id });
  }

  return (
    <Body content={
    <div className="my_profile">
      <div className="my_profile_left">
        <div className="user_infos">
          <div className="user_infos_avatar">
            <div className="avatar_medium">
              <img src={avatar || '/images/default_user.jpg'} alt="profile picture" layout="fill" />
            </div>
            <div className="avatar_change">
              <input type="file" name="myImage" accept="image/x-png, image/jpeg" onChange={uploadToClient} />
               <button className={classes.button_green} type="submit" onClick={uploadToServer} >
                Upload Avatar
              </button>
              {errors === 'there is a problem with your avatar, choose another' ? errors : <div></div>}
              {errors === 'file too big, max 5Mo' ? errors : <div></div>}
            </div>
          </div>
          <div className="user_infos_login">
            <div className="login">
              Login : {currentUser!.login}
            </div>
            <div className="login_change">
              <form onSubmit={modifyLogin}>
                <div>
                  <input code='login' id='login' placeholder='New Login' aria-label='New Login' required minLength="1" maxLength="20" ref={inputLoginRef} />
                  <button className={classes.button_green}>Enter new Login</button>
                </div>
              </form>
              {errors === 'login already taken, choose another' ? errors : <div></div>}
              {errors === 'wrong login size, must be <1 or >21' ? errors : <div></div>}
            </div>
          </div>
          <div className="user_infos_2fa">
            <div>2FA : {currentUser!.level2factor_auth === 'false' ? 'off' : 'on'}</div>
            <button className={classes.button_green} onClick={generate2FAHandler}>
              <QrCode2Icon/>
              <img src={qrCodeUrl} />
            </button>
          </div>
          {twoFAEnabled === "false" ?
            <div className="user_infos_2fa_code">
              <form onSubmit={turnOn2FAHandler}>
                <div>
                  <input code='code' id='code' placeholder='Your 2FA code' aria-label='Your 2FA code' ref={inputCodeRef} />
                  <button className={classes.button_green}>Turn on 2FA</button>
                </div>
              </form>
              {credsAreWrong ? <p>Wrong authentication code</p> : <p></p>}
            </div>
            :
            <div className="user_infos_2fa_code">
              <form onSubmit={turnOff2FAHandler}>
                <div>
                  <input code='code' id='code' placeholder='Your 2FA code' aria-label='Your 2FA code' ref={inputCodeRef} />
                  <button className={classes.button_green}>Turn off 2FA</button>
                </div>
              </form>
              {credsAreWrong ? <p>Wrong authentication code</p> : <p></p>}
            </div>
          }
        </div>
        <div className="user_stats">
          < GameStats user={currentUser} items={games} rank={rank}/>
        </div>
        <div className="user_games">
            < GameList items={games}/>
        </div>
      </div>
      <div className="my_profile_right" >
        <div className="user_blocked">
          <BlockedList items={blocked} onFriendRequest={handleFriendRequest}/>
        </div>
        <div className="user_friends">
          <FriendList items={friends} onFriendRequest={handleFriendRequest}/>
        </div>
        <div className="user_asks">
          <AskList items={asking} onFriendRequest={handleFriendRequest}/>
        </div>
      </div>
    </div>
  }/>
  );
}

export default Profile;
