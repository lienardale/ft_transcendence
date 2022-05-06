import React, { Fragment }  from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType} from '../api/db/types';
import PopUp from '../ui/popup';
import { CurrentUserContext } from '../../hook/session';
import { ChatSocketContext } from "../../hook/chat-socket";
import responseHandler from '../../helpers/response-handler';
import AuthChecker from "../../hook/auth-checker";
import fetchParams from '../../helpers/helperFetch';
import classes from '../../styles/pages/Chat.module.css';
import Button from '../../styles/components/buttons.module.css';

function ListChannelMembers(props: any) {
  const chatCtx = React.useContext(ChatSocketContext);
  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const [open, setOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [popUpTitle, setpopUpTitle] = React.useState('');
  const [userID, setUserID] = React.useState();
  const authCtx = React.useContext(AuthChecker);
  let navigate = useNavigate();
  let mounted :boolean = true;    
 
  React.useEffect(() => {
    if (props.admins != undefined) {
      const checkAdmin = props.admins.find(admin => admin.id === currentUser.id);
      checkAdmin !== undefined ? setIsAdmin(true) : setIsAdmin(false);
      if (props.isWebAdmin) {
        setIsAdmin(true);
      }
    }
    return () => {
      mounted = false;
    }
  }, [props.members, props.admins, props.owner]);

  function handleAdmin(user: UserType) {
    setOpen(true);
    setUserID(user.id);
    setpopUpTitle('How to punish ' + user.login);
  }

  const handleClose = () => {
    setOpen(false);
  }

  function handleKick(event) {
    event.preventDefault();
    chatCtx.chatSocket.emit('removeMember', { id_channel: props.channelSelected.id, id_user: userID }); 
    setOpen(false);
  }

  function handleBan(event) {
    event.preventDefault();
    if (props.channelSelected.members.length === 1 && props.channelSelected.members[0].id === userID) {
      chatCtx.chatSocket.emit('removeMember', { id_channel: props.channelSelected.id, id_user: userID }); 
    } else {
      chatCtx.chatSocket.emit('removeMember', { id_channel: props.channelSelected.id, id_user: userID }); 
      chatCtx.chatSocket.emit('addBanned', { id_channel: props.channelSelected.id, id_user: userID });
    }
    setOpen(false);
  }

  async function handleMute(event) {
    event.preventDefault();
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const date = new Date();
    date.setHours(date.getHours() + 1);
    let params = await fetchParams('POST',
        { unmutetime: date.toUTCString(), channel : props.channelSelected.id, user: userID }
    );
    if (params !== null) {
      let done: boolean = false;
      await fetch('http://localhost:3001/mute-list', params)
      .then(response => responseHandler(response))
      .then(_response => done = true)
      .catch(_error => console.error("error in mute creation"));
      if (done && mounted) {
        chatCtx.chatSocket.emit('majChannelSelectedToServer', props.channelSelected.id);
      }
    }
    setOpen(false);
  }

  function handleView(member) {
    let url = `/users/${member.id}`;
    navigate(url);
  }

  return (
    <Fragment>
    {(!props.members || !props.admins || !props.owner || !props.channelSelected) ? <p></p> :
      <div className={classes.list_block}>
          <div className={classes.list_block_small}>
            <p>{props.label}</p>
            <div className={classes.sous_section_row}>
              <p>{props.channelSelected.name}</p>
              <p>{props.channelSelected.channel_type}</p>
            </div>
            {props.members.length !== 0 &&
            <ul>{props.members.map((member) => (
              <li key={member.id} className={classes.list_block_li}>
                <img src={member.avatar_path} />
                {member.status === 'CONNECTED' ? 
                  <img src='/images/connected.png' title='connected' /> : <area></area> }
                {member.status === 'AWAY' ? 
                  <img src='/images/turn-off.png' title='away' /> : <area></area> }
                {member.status === 'GAMING' ? 
                  <img src='/images/playing.png' title='playing' /> : <area></area> }
                {member.status === 'SEARCHING' ? 
                  <img src='/images/searching.png' title='searching for a game' /> : <area></area> }
                {member.login}
                
                { props.admins.map(admin => (admin.id)).includes(member.id) ? 
                  (member.id === props.owner.id) ? 
                  <img src='/images/crown.png' title='is owner' /> :
                  <img src='/images/key.png' title='is admin' /> : <area></area>
                }
                { member.id === currentUser.id ? 
                <span>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span>
                :
                !isAdmin ? <area></area> : 
                  (member.id === props.owner.id && !props.isWebAdmin) ? 
                    <area></area> : 
                    <button 
                      className={Button.button_invisible} 
                      title="punish"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAdmin(member);
                      }}
                    ><img src='/images/faute.png'/></button>
                }
                { member.id === currentUser.id ? <area></area> :
                <button 
                    className={Button.button_simple} 
                      title="visit profile"
                      onClick={(e) => {
                        e.preventDefault();
                        handleView(member);
                      }}
                    >Visit</button>
                }
              </li>
            ))} 
          </ul>}
        </div>
        <PopUp
          title={popUpTitle}
          open={open}
          onClose={handleClose}
        >
          <p><button className={Button.button_text} onClick={handleKick}>Kick this member out fo the channel</button></p>
          <p><button className={Button.button_text} onClick={handleBan}>Ban forever this member from the channel</button></p>
          <p><button className={Button.button_text} onClick={handleMute}>Mute this member in this channel for one hour</button></p>
        </PopUp>
      </div>
    }
    </Fragment>
  );
}

export default ListChannelMembers;