import React from "react";
import Body from '../components/body';
import fetchParams from "../helpers/helperFetch";
import responseHandler from "../helpers/response-handler";
import AuthChecker from "../hook/auth-checker";
import LadderList from "../components/ladder/LadderList";
import { ChatSocketContext } from "../hook/chat-socket";

function Ladder(){
  const [users, setUsers] = React.useState([]);
  const authCtx = React.useContext(AuthChecker);
	const chatCtx = React.useContext(ChatSocketContext);
  const [mounted, setMounted] = React.useState<Boolean>(true);
  const [controller, setController] = React.useState(new AbortController());

  async function reloadUsers() {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
        await fetch("http://localhost:3001/users/games-won", {...params,
        signal: controller.signal
      })
        .then(response => responseHandler(response))
        .then(users => {
          if (mounted === true)
            setUsers(users.filter(user => user.user_login))}
        )
        .catch(_error => {});
        } 
  }
  
  React.useEffect(() => {
    reloadUsers();

    let ulogin = () => {
      reloadUsers();
    }
    chatCtx.chatSocket.on('majLogins', ulogin)

    return () => {
      chatCtx.chatSocket.off("majLogins", ulogin);
      setMounted(false)
      controller?.abort()
    }
  }, []);

  if (users !== null)
  {
      return (
        <Body content={
          <div className="ladder">
              <LadderList users={users}/>
          </div>
        }/>
      )
  }
  else {
    return (
        <Body content={ 
          <div>
          </div>
        }
      />
    )
  }
}

export default Ladder;