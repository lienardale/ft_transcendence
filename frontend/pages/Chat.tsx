import React from 'react';
import Body from '../components/body';
import { ChannelFull, ChannelSelected, UserType, UserFull } from '../api/db/types';
import { CurrentUserContext } from '../hook/session';
import PersonnalInfo from "../components/chat/personnalInfo";
import ChannelInfo from "../components/chat/channelInfo";
import LeaveChannel from "../components/chat/leaveChannel";
import ChangeMembers from "../components/chat/changeMembers";
import Channels from "../components/chat/channels";
import ChannelMessages from "../components/chat/channelMessages";
import ChannelCreation from "../components/chat/channelCreation";
import PersonnalMessages from "../components/chat/personnalMessages";
import OwnerSection from '../components/chat/ownerSection';
import ListUsers from '../components/chat/ListUsers';
import ListChannelMembers from '../components/chat/listChannelMembers';
import fetchGet from '../helpers/fetchGet';
import AuthChecker from "../hook/auth-checker";
import { ChatSocketContext } from "../hook/chat-socket";
import classes from '../styles/pages/ChatFlex.module.css';
import responseHandler from '../helpers/response-handler';
import fetchParams from '../helpers/helperFetch';
import { useNavigate } from 'react-router-dom';

let channelInit : ChannelSelected = {
  "id": 0,
  "channel_type": "public",
  "name": "Select a channel",
  "password": "MDP",
  "user_owner": {
    "status": "CONNECTED",
    "level": "0",
    "level2factor_auth": "false",
    "id": 1,
    "email": "akerloc-@student.42.fr",
    "login": "akerloc-",
    "avatar_path": "NR",
    "asked": [],
    "asking": [],
    "avatar": "NR",
    "channels": [],
    "messages": [],
    "friends": [],
    "blocking": [],
    "blocked_by": [],
    "games": [],
    "web_admin": false,
    "banned_user": false,
  },
  "messages": [
      {
          "id": 1,
          "content": "loading",
          "datetime": "2021-12-24T02:12:25.000Z",
          "user_writer": {
              "status": "CONNECTED",
              "level": "0",
              "level2factor_auth": "false",
              "id": 1,
              "email": "akerloc-@student.42.fr",
              "login": "akerloc-",
              "avatar_path": "NR",
              "avatar": "NR",
              "channels": [],
              "messages": [],
              "asked": [],
              "asking": [],
              "friends": [],
              "blocking": [],
              "blocked_by": [],
              "games": [],
              "web_admin": false,
              "banned_user": false,
          }
      }
  ],
 "members": [],
 "banned": [],
 "mute": [
    {
      "id": 1,
      "unmutetime": "2022-03-16T23:38:06.000Z",
      "user": {
          "status": "CONNECTED",
          "level": "0",
          "level2factor_auth": "false",
          "id": 1,
          "email": "akerloc-@student.42.fr",
          "login": "akerloc-",
          "avatar_path": "NR",
          "avatar": "NR",
          "channels": [],
          "messages": [],
          "asked": [],
          "asking": [],
          "friends": [],
          "blocking": [],
          "blocked_by": [],
          "games": [],
          "web_admin": false,
          "banned_user": false,
      }
    }
  ],
}

function Chat() {
  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const authCtx = React.useContext(AuthChecker);
  const chatCtx = React.useContext(ChatSocketContext);
  let navigate = useNavigate();
   
  const [channels, setChannels] = React.useState<ChannelFull[]>([]);
  const [logins, setLogins] = React.useState<UserFull[]>([]);
  const [channelSelected, setChannelSelected] = React.useState<ChannelSelected>(channelInit);

  const [channelIsSelected, setChannelIsSelected] = React.useState(false);
  const [showChanInfo, setShowChanInfo] = React.useState(false);
  const [showPersInfo, setShowPersInfo] = React.useState(false);
  const [controller, setController] = React.useState(new AbortController());
  let mounted :boolean = true;

  async function firstRender() {
    await getChannels();
    await getLogins();
  }

  async function getChannels() {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const ret: ChannelFull[] = await fetchGet('/api/channels/all/' + currentUser!.id, controller)
    if (ret !== undefined) {
      if (mounted) {
          setChannels(ret);
      }
    }
  }

  async function getLogins() {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const ret: UserFull[] =  await fetchGet('/api/users/all/' + currentUser!.id, controller)
    if (ret !== undefined) {
      if (mounted) {
          setLogins(ret);
      }
    }
  }

  async function getChannelSelected(channelId: Number) {
    const ret: ChannelSelected = await fetchGet('/api/channels/selected/' + channelId, controller)
    if (ret !== undefined) {
      if (mounted) {
        setChannelSelected(ret);
      }
    }
  }

  React.useEffect(() => {
    firstRender();

    let uchans = () => {
      getChannels();
    }
    chatCtx.chatSocket.on('majChannels', uchans);

    let uselectchans = 
     (data :Number) => {
      getChannelSelected(data);
    }
    chatCtx.chatSocket.on('majChannelSelected',uselectchans)

    let ulogins = () => {
      getLogins();
    }
    chatCtx.chatSocket.on('majLogins', ulogins)

    let uavatar = () => {
      getLogins();
    }
    chatCtx.chatSocket.on('majAvatar', uavatar)

    let usupchan = (data :Number) => {
      setChannelIsSelected(false);
      setShowChanInfo(false);
      getChannels();
    }
    chatCtx.chatSocket.on('supChannel', usupchan)

   
	  return () => {
      mounted = false;
      chatCtx.chatSocket.off("majChannels", uchans);
      chatCtx.chatSocket.off("majChannelSelected", uselectchans);
      chatCtx.chatSocket.off("majLogins", ulogins);
      chatCtx.chatSocket.off("majAvatar", uavatar);
      chatCtx.chatSocket.off("supChannel", usupchan);
      controller?.abort()
    }

  }, []);

  async function fetchChannelSelected(idChannel : Number) {
    const old = channelSelected.id;
    await getChannelSelected(idChannel);
    if (mounted) {
      chatCtx.chatSocket.emit('changeRoom', { id_old_channel: old, id_new_channel: idChannel, id_user: currentUser!.id });
      setChannelIsSelected(true);
      setShowChanInfo(false);
    }
  }

  function handleCloseChannel() {
    if (mounted) {
      setChannelIsSelected(false);
      chatCtx.chatSocket.emit('leaveRoom', channelSelected.id);
      setShowChanInfo(false);
    }
  }

  function handleLeaveChannel() {
    handleCloseChannel();
    chatCtx.chatSocket.emit('removeMember', { id_channel: channelSelected.id, id_user: currentUser!.id });
  }

  function handleMemberListChange(inputGuestId: Number) {
    chatCtx.chatSocket.emit('addMember', { id_channel: channelSelected.id, id_user: inputGuestId }); 
  }

  function handleShowChanInfo(show: boolean) {
    if (mounted) {
      show ? setShowChanInfo(true) : setShowChanInfo(false)
    }
  }

  function handleShowPersInfo(show: boolean) {
    if (mounted) {
      show ? setShowPersInfo(true) : setShowPersInfo(false)
    }
  }

  function handleView(member) {
    const url = `/users/${member.id}`;
    navigate(url);
  }

  async function handlePMCreation(input:UserType) {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('POST', { channel_type: "pm", id_pm: input.id, name: '', hasPassword: false, password : '', user_owner: currentUser!.id } );
    if (params !== null) {
      fetch('/api/channels', {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then(response => { 
        chatCtx.chatSocket.emit('channelToServer', JSON.stringify(response)); 
        chatCtx.chatSocket.emit('addMember', { id_channel: response.id, id_user: input.id }); 
        fetchChannelSelected(response.id);
      })
      .catch(_error => console.error("error in PM"));
    }
  }

  async function handleTalk(input:UserType) {
    const channelFound = channels.find((e : ChannelFull) => (e.userOwnerId === input.id && e.id_pm === currentUser!.id && e.channel_type === 'pm') || (e.userOwnerId === currentUser!.id && e.id_pm === input.id && e.channel_type === 'pm'));
    if (channelFound === undefined) {
      await handlePMCreation(input);
    }
    else {
      await fetchChannelSelected(channelFound.id);
    }
  }

  return (
    <Body content={
    <div className={classes.wrapper}>
      {/* 1 */}
      <div className={classes.columns}>
        <div className={classes.rows}>
          <ChannelCreation
            channels={channels}
            onChannelSelection={fetchChannelSelected}
          />
          <PersonnalMessages 
            myChannels={channels.filter(channel => (channel.iAmMember === 1))}
            onChannelSelection={fetchChannelSelected}
            onChannelPMCreation={handlePMCreation}
            filtre={logins.filter((user:UserFull) => (user.isBlockedByMe === 1 || user.id === currentUser!.id))} 
          />
          <PersonnalInfo 
            showPersInfo={showPersInfo}
            onShow={handleShowPersInfo}
          />
        </div>
        {showPersInfo ? 
          <Channels
            label={"CHANNELS I OWN"}
            channels={channels.filter((channel: ChannelFull) => (channel.userOwnerId === currentUser!.id))}
            onChannelSelection={fetchChannelSelected}
            buttonLabel={"Join"}
            isWebAdmin={false}
            logins={logins}
          />
        :
          <ListUsers
            users={logins.filter((user:UserFull) => (user.id !== currentUser!.id && user.status !=="AWAY" && user.isBlockedByMe === 0 && user.login))} 
            label={"CONNECTED USERS"}
            webAdmin={false}
            banned_user={false}
            button1={"Visit"}
            button2={"Talk"}
            function1={handleView}
            function2={handleTalk}
          />
        }
      </div>
      {/* 2 */}
      <div className={classes.columns}>
        {showChanInfo && channelSelected.members.map(elem => elem.id).includes(currentUser.id) ? <area></area> :
          <Channels 
            label={"PUBLIC CHANNELS"}
            channels={channels.filter((channel: ChannelFull) => (channel.channel_type === 'public' && channel.iAmBanned === 0))}
            onChannelSelection={fetchChannelSelected}
            buttonLabel={"Join"}
            isWebAdmin={false}
            logins={logins}
          />
        }
        {showChanInfo && channelSelected.members.map(elem => elem.id).includes(currentUser.id) ? <area></area> :
          <Channels
            label={"MY CHANNELS"}
            channels={channels.filter((channel: ChannelFull) => (channel.iAmMember === 1 && channel.iAmBanned === 0 && channel.iBlock === 0))}
            onChannelSelection={fetchChannelSelected}
            buttonLabel={"Join"}
            isWebAdmin={false}
            logins={logins}
          />
        }
          {!showChanInfo || !channelSelected.members.map(elem => elem.id).includes(currentUser.id) ? <area></area> :
          <ListChannelMembers
            members={channelSelected.members} 
            admins={channelSelected.admins}
            label={"MEMBERS OF THE CHANNEL"}
            channelSelected={channelSelected}
            owner={channelSelected.user_owner}
            isWebAdmin={false}
          />
        }
        {!showChanInfo ? <area></area> :
          <OwnerSection
            channelSelected={channelSelected}
            members={channelSelected.members} 
            admins={channelSelected.admins}
            logins={logins}
            isWebAdmin={false}
          />
        }
      </div>
      {/* 3 */}
      <div className={classes.columns}>
        <div className={classes.rows}>
          {!channelIsSelected || !channelSelected.members.map(elem => elem.id).includes(currentUser.id) || (channelSelected.channel_type === 'pm') ? <area></area> :
            <ChangeMembers 
              label={"Invite new user to channel"}
              onMemberListChange={handleMemberListChange} 
              filtre={channelSelected.members.concat(channelSelected.banned).concat(logins.filter(user => !user.login))}
              buttonChoice={"big_button"}
            />
          }
          {!channelIsSelected || !channelSelected.members.map(elem => elem.id).includes(currentUser.id) || (channelSelected.channel_type === 'pm') ? <area></area> :
            <ChannelInfo 
              showChanInfo={showChanInfo}
              onShow={handleShowChanInfo}
            />
          }
          {!channelIsSelected || !channelSelected.members.map(elem => elem.id).includes(currentUser.id) || (channelSelected.channel_type === 'pm') ? <area></area> :
            <LeaveChannel 
              onLeaving={handleLeaveChannel}
            />
          }
        </div>
        {!channelIsSelected || !channelSelected.members.map(elem => elem.id).includes(currentUser.id) ? <area></area> :
          <ChannelMessages
            onCloseChannel={handleCloseChannel}
            channelSelected={channelSelected}
            logins={logins}
            blocked={logins.filter((user : UserFull) => (user.isBlockedByMe === 1))}
						isWebAdmin={false}
          />
        }
      </div>
    </div>
    }
    />
  )
}

export default Chat;
