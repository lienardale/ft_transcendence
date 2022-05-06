import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Play from "../pages/Play";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";
import Error404 from "../pages/Error404";
import Ladder from "./Ladder";
import FirstLogin from "./FirstLogin";
import UserProfile from "../pages/users/UserProfile";
import Body from "../components/body";
import { CurrentUserContext } from '../hook/session';
import fetchParams from "../helpers/helperFetch";
import responseHandler from "../helpers/response-handler";
import Layout from "../components/layout/Layout";
import {FriendsContextProvider} from "../hook/friend-context";
import { ChatSocketContext } from "../hook/chat-socket";
import io from "socket.io-client";
import checkToken from "../helpers/checkToken";
import LayoutFirst from "../components/layout/LayoutFirst";

function HomePage({ query }) {
  const [token, setToken] = useState("");
  const [credsAreWrong, setCredsAreWrong] = useState(false);
  const [alreadyConnected, setAlreadyConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const inputCodeRef = useRef();
  const chatCtx = React.useContext(ChatSocketContext);

  async function loginHandler(event) {
    event.preventDefault();
    const code = inputCodeRef.current.value;
    if (code.length === 0) { 
      setCredsAreWrong(true);
      return ;
    }
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const params = {
      method: 'POST',
      body: JSON.stringify({code, user: currentUser}),
      headers: headers
    };
    await fetch("http://localhost:3001/2fa/authenticate", params)
    .then(response => responseHandler(response))
    .then((response) =>  handleToken(response))
    .catch(_error => {
      setCredsAreWrong(true); 
    });
  }

  async function handleToken(newValue : any) {
    const { user, accessToken, refreshToken } = newValue;
    if (accessToken !== '2fa') {
      setToken(accessToken);
      localStorage.setItem("currentUser", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
    await connectChatSocket(user, accessToken);
    setCurrentUser(user);
    setCredsAreWrong(false);
  }

  async function logWithToken(accessToken: string | null, refreshToken: string | null) {
    let connexionResult:string = 'token-ok';
    if (typeof accessToken === 'string') {
      setToken(accessToken); 
    }
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch("http://localhost:3001/logWithToken", params)
      .then(response => responseHandler(response))
      .then((response) => {
        handleToken({ 
          user: response, 
          accessToken, 
          refreshToken
        });
        connexionResult = 'token-ok';
      })
      .catch(_error => connexionResult = 'token-ko');
    }
    return connexionResult;
  }

  async function refresh(refreshToken: string | null) {
    let connexionResult:string = 'token-ok';
    const customHeaders = new Headers({
        'Authorization': 'Bearer ' + refreshToken
    });
    const params = { headers: customHeaders };
    await fetch("http://localhost:3001/refresh", params)
    .then(response => responseHandler(response))
    .then((response) => {
        handleToken({ 
        user: response.user, 
        accessToken: response.accessToken, 
        refreshToken 
      });
      connexionResult = 'token-ok';
    })
    .catch(_error => { 
      connexionResult = 'token-ko';
    });
    return connexionResult;
  }

  async function logWith42(query) {
    await fetch("http://localhost:3001/42auth?code=" + query.code)
    .then(response => responseHandler(response))
    .then(response => {
      if (response.accessToken === 'token-connected') { 
        setAlreadyConnected(true);
      }
      else if (response.accessToken === '2fa') {
        setTwoFA(true);
      }
      handleToken(response); 
    })
    .catch(_error => {
      // console.error(error)
    });
  }

  async function connectChatSocket(user: any, accessToken :any) {
    const newSocket = io("http://localhost:3001", { auth: { token: accessToken, id_user: user.id  } } );
    chatCtx.setChatSocket(newSocket);
  }

  async function log(accessToken: string | null, refreshToken: string | null, query) {
    let connexionResult:string = 'token-ko';

    if (accessToken !== null) {
      connexionResult = await checkToken(accessToken, 1);
      if (connexionResult === 'token-ok') 
      {
        connexionResult = await logWithToken(accessToken, refreshToken);
      } 
      else if (connexionResult === 'token-connected') 
      {
        setAlreadyConnected(true);
      } 
      else {
      }
    }

    if (connexionResult === 'token-ko' || (accessToken === null && refreshToken !== null)) {
      connexionResult = await checkToken(refreshToken, 2, currentUser);
      if (connexionResult === 'token-ok') 
      {
        connexionResult = await refresh(refreshToken);
      } 
      else if (connexionResult === 'token-connected') 
      {
        setAlreadyConnected(true);
      } 
      else {
      }
    }

    if (connexionResult === 'token-ko' || (accessToken === null && refreshToken === null)) {
      if (query.code !== undefined) {
        await logWith42(query);
      }
    }
    setLoading(false);
  }

  function redirect(event) {
    event.preventDefault(); 
    const url =
      "https://api.intra.42.fr/oauth/authorize?client_id=" +
      process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID +
      "&redirect_uri=" +
      process.env.NEXT_PUBLIC_FORTY_TWO_REDIRECT_URI +
      "&response_type=code&scope=public&state=" +
      process.env.NEXT_PUBLIC_FORTY_TWO_STATE;
      setLoading(true);
      window.location.href = encodeURI(url);
  }

  React.useLayoutEffect(() => {
    setLoading(true);
    const accessToken = localStorage.getItem('currentUser');
    const refreshToken = localStorage.getItem('refreshToken');
    log(accessToken, refreshToken, query);
	  document.querySelector(".wrapper").style.height = "100vh";
    
    return () => {}
	}, []);

  if (currentUser && token) {
    if (currentUser.banned_user) {
      return(
        <FriendsContextProvider>
          <Router>
            <Layout >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/404" element={<Error404/>} />
                <Route path="*" element={<Error404/>} />
              </Routes>
            </Layout>
          </Router>
        </FriendsContextProvider>
      );
    }
    else if (currentUser.login === null){
      return(
        <Router>
          <LayoutFirst>
            <Routes>
                <Route path="/" element={<FirstLogin/>}/>
            </Routes>
          </LayoutFirst>
        </Router>
      )
    }

    return (
      <FriendsContextProvider>
        <Router>
          <Layout >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<Play/>} />
              <Route path="/ladder" element={<Ladder/>} />
              <Route path="/chat" element={<Chat/>} />
              <Route path="/profile" element={<Profile/>} />
              <Route path="/admin" element={<Admin/>} />
              <Route path="/users/:id" element={<UserProfile/>} />
              <Route path="/404" element={<Error404/>} />
              <Route path="*" element={<Error404/>} />
            </Routes>
          </Layout>
        </Router>
      </FriendsContextProvider>
    );
  } else if (twoFA && currentUser) {
    return (
      <Body
        content={
          <div className="button_garrong_sign">
            <form onSubmit={loginHandler}>
              <div>
                  <input
                    code='code'
                    id='code'
                    placeholder='Your twoFA code'
                    aria-label='Your twoFA code'
                    ref={inputCodeRef}
                  />
                  <button>Register</button>
              </div>
              {credsAreWrong ? <p>Wrong authentication code</p> : <p></p>}
            </form>
          </div>
        }
      />
    );
  } else if (!loading) {
    return (
      <Body
        content={
          <div>
            {alreadyConnected ? <p>You are already connected</p> : 
              <div className="button_garrong_sign">
                <button className="button_garrong" onClick={redirect}>
                  Sign in with 42 account
                </button>
              </div>
            }
          </div>
        }
      />
    );
  } else {
    return (
      <Body
        content={
          <p>Loading</p> 
        }
      />
    );
  }
}

HomePage.getInitialProps = ({ query }) => {
  return { query };
};

export default HomePage;