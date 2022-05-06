import React, { Fragment }  from 'react';
import classes from '../../styles/pages/Chat.module.css';
import Button from '../../styles/components/buttons.module.css';
import { CurrentUserContext } from '../../hook/session';
import { ChatSocketContext } from "../../hook/chat-socket";
import { UserFull } from '../../api/db/types';
import PopUp from '../ui/popup';

function ListUsers(props: any) {
  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const chatCtx = React.useContext(ChatSocketContext);
  const [open, setOpen] = React.useState(false);
  const [loginAsked, setLoginAsked] = React.useState("");
  const [idAsked, setIdAsked] = React.useState(0);

  function handleGame(user: UserFull) {
    chatCtx.chatSocket.emit('askGame', { id_asked : user.id, id_asking: currentUser!.id, login_asking: currentUser!.login });
    setLoginAsked(user.login);
    setIdAsked(user.id);
    setOpen(true);
  }

  function handleCancel() {
    chatCtx.chatSocket.emit('cancelGame', { id_asked : idAsked, id_asking: currentUser!.id, login_asking: currentUser!.login });
    setOpen(false);
  }

  React.useEffect(() => {
    let ugame = (data) => {
      const dataFromServer : { id_asked : number } = data;
      if (dataFromServer.id_asked === currentUser.id) {
          setOpen(false);
      }
    }
    chatCtx.chatSocket.on('cancelGameToClient', ugame);
    
    return () => {
      chatCtx.chatSocket.off("cancelGameToClient", ugame);
    }

  }, []);

  return (
    <Fragment>
    {(!props.users) ? <p></p> :
      <div className={classes.list_block}>
        <div className={classes.list_block_tall}>
          <p>{props.label}</p>
            {props.users.length !== 0 &&
              <ul> { props.users.map((member :UserFull) => (
                <li key={member.id} className={classes.list_block_li}>
                  <img src={member.avatar_path}/>
                  {member.status === 'CONNECTED' ? 
                    <img src='/images/connected.png' title='connected' /> : <area></area> }
                  {member.status === 'GAMING' ? 
                    <img src='/images/playing.png' title='playing' /> : <area></area> }
                  {member.status === 'SEARCHING' ? 
                    <img src='/images/searching.png' title='searching for a game' /> : <area></area> }
                    {member.status === 'AWAY' ? 
                      <img src='/images/away.png' title='away' /> : <area></area> }
                  {member.login}
        
                  {props.webAdmin === true && member.id == 1 ? <area></area> :
                    <div>
                    <button 
                      className={Button.button_simple} 
                      onClick={(e) => {
                        e.preventDefault();
                        props.function1(member);
                      }}
                    >
                      {props.webAdmin && member.banned_user ?
                        <div>
                          Unban
                        </div> :
                        <div>
                          {props.button1}
                        </div>
                      }
                    </button>
                    { member.banned_user ? <area></area> :
                    <button 
                      className={Button.button_simple} 
                      onClick={(e) => {
                        e.preventDefault();
                        props.function2(member);
                      }}
                    >
                      {props.webAdmin && member.web_admin ?
                        <div>
                          Unset admin
                        </div> :
                        <div>
                          {props.button2}
                        </div>
                      }
                    </button>
                    }
                    </div>
                  }
                  { (props.webAdmin === false && member.status === "CONNECTED") ?  
                    <div>
                      <button 
                        className={Button.button_simple} 
                          title="Ask for a Game"
                          onClick={(e) => {
                            e.preventDefault();
                            handleGame(member);
                          }}
                      >Play</button>
                    </div>
                    : <area></area>
                  }
                </li>
              ))} 
            </ul>}
        </div>
        <PopUp
          title={'Waiting for an Answer'}
          context={'We asked '+ loginAsked + ' for a game. Please wait for them !'}
          onClose={handleCancel}
          open={open}
        >
        </PopUp>
      </div>
    }
    </Fragment>
  );
}

export default ListUsers;