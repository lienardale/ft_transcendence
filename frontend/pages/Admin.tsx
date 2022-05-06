import React from "react";
import Body from '../components/body';
import AuthChecker from "../hook/auth-checker";
import fetchGet from '../helpers/fetchGet';
import { ChatSocketContext } from "../hook/chat-socket";
import { CurrentUserContext } from '../hook/session';
import { ChannelFull, ChannelSelected, UserFull } from '../api/db/types';
import ListUsers from '../components/chat/ListUsers';
import Channels from "../components/chat/channels";
import ListChannelMembers from '../components/chat/listChannelMembers';
import OwnerSection from '../components/chat/ownerSection';
import ChannelMessages from "../components/chat/channelMessages";
import responseHandler from '../helpers/response-handler';
import fetchParams from '../helpers/helperFetch';
import classes from '../styles/pages/ChatFlex.module.css';
import ChangeMembers from "../components/chat/changeMembers";
import LeaveChannel from "../components/chat/leaveChannel";

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
   "mute": [],
  }

function Admin(props: any) {

	const { value: currentUser } = React.useContext(CurrentUserContext)!;
	const authCtx = React.useContext(AuthChecker);
	const chatCtx = React.useContext(ChatSocketContext);
	const [channels, setChannels] = React.useState<ChannelFull[]>([]);
	const [logins, setLogins] = React.useState<UserFull[]>([]);
	const [channelSelected, setChannelSelected] = React.useState<ChannelSelected>(channelInit);
	const [channelIsSelected, setChannelIsSelected] = React.useState(false);
	const [showChanInfo, setShowChanInfo] = React.useState(false);
	const [controller, setController] = React.useState(new AbortController());
	var new_page = false;

	async function firstRender() {
		await getChannels();
		await getLogins();
		if (new_page === true)
			return ;
	}

	async function getChannels() {
		await authCtx.authCheck(localStorage.getItem("currentUser"));
		let ret: ChannelFull[];
		(ret = await fetchGet('http://localhost:3001/channels/all/' + currentUser!.id, controller)) !== undefined ? setChannels(ret) : 0;
		if (new_page === true)
			return ;
	}

	async function getLogins() {
		await authCtx.authCheck(localStorage.getItem("currentUser"));
		let ret: {};
		(ret = await fetchGet('http://localhost:3001/users/all/' + currentUser!.id, controller)) !== undefined ? setLogins(ret) : 0;
		if (new_page === true)
			return ;
	}

	async function getChannelSelected(channelId: Number) {
		let ret: {};
		(ret = await fetchGet('http://localhost:3001/channels/selected/' + channelId, controller)) !== undefined ? setChannelSelected(ret) : 0;	
		if (new_page === true)
			return ;
	}

  React.useEffect(() => {
    firstRender();
	new_page = false;

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
  
	  let usupchan = (data :Number) => {
		setChannelIsSelected(false);
		setShowChanInfo(false);
		getChannels();
	  }
	  chatCtx.chatSocket.on('supChannel', usupchan)

	let uavatar = () => {
		getLogins();
	}
	chatCtx.chatSocket.on('majAvatar', uavatar)
   
	  return () => {
		  new_page = true;
		  chatCtx.chatSocket.off("majChannels", uchans);
		  chatCtx.chatSocket.off("majChannelSelected", uselectchans);
		  chatCtx.chatSocket.off("majLogins", ulogins);
		  chatCtx.chatSocket.off("majAvatar", uavatar);
		  chatCtx.chatSocket.off("supChannel", usupchan);
		  controller?.abort()
	  }

  }, []);

	function handleAddWebAdmin(id: number) {
	chatCtx.chatSocket.emit('majLoginsServer', { id_user: id });
	chatCtx.chatSocket.emit('addWebAdmin', { id_channel: channelSelected.id, id_user: id }); 
	if (new_page === true)
		return ;
	}
	
	function handleMemberListChange(inputGuestId: Number) {
		chatCtx.chatSocket.emit('addMember', { id_channel: channelSelected.id, id_user: inputGuestId }); 
	}

	function handleLeaveChannel() {
		handleCloseChannel();
		chatCtx.chatSocket.emit('removeMember', { id_channel: channelSelected.id, id_user: currentUser!.id });
	}

	function handleRemoveWebAdmin(id: number) {
		chatCtx.chatSocket.emit('majLoginsServer', { id_user: id });
		chatCtx.chatSocket.emit('removeWebAdmin', { id_channel: channelSelected.id, id_user: id }); 
		if (new_page === true)
			return ;
	}

	async function handleWebAdmin(member : any) {
		await authCtx.authCheck(localStorage.getItem("currentUser"));
		var webAdmin: boolean;
		member.web_admin ? webAdmin = false : webAdmin = true;
		const params = await fetchParams('PATCH', { web_admin: webAdmin });
		if (params !== null) {
		fetch("http://localhost:3001/user/" + member.id, {...params,
        signal: controller.signal
      })
		.then(response => responseHandler(response))
		.then((data) => { 
			getLogins(); })
		.catch(error => console.error("error : ", error));
		}
		webAdmin ? handleAddWebAdmin(member.id) : handleRemoveWebAdmin(member.id);
		if (new_page === true)
			return ;
	}

	function handleAddBanned(id: number) {
	chatCtx.chatSocket.emit('majLoginsServer', { id_user: id });
	chatCtx.chatSocket.emit('addWebBanned', { id_channel: channelSelected.id, id_user: id }); 
	if (new_page === true)
		return ;
	}

	function handleRemoveBanned(id: number) {
	chatCtx.chatSocket.emit('majLoginsServer', { id_user: id });
	chatCtx.chatSocket.emit('removeWebBanned', { id_channel: channelSelected.id, id_user: id }); 
	if (new_page === true)
		return ;
	}

	async function handleBan(member : any) {
		await authCtx.authCheck(localStorage.getItem("currentUser"));
		var ban: boolean;
		member.banned_user ? ban = false : ban = true;
		const params = await fetchParams('PATCH', { banned_user: ban });
		if (params !== null) {
		  fetch("http://localhost:3001/user/" + member.id, {...params,
		  signal: controller.signal
		})
		  .then(response => responseHandler(response))
		  .then((data) => {
			getLogins();
		  })
		  .catch(error => console.error("error : ", error));
		}
		ban ? handleAddBanned(member.id) : handleRemoveBanned(member.id);
		if (new_page === true)
			return ;
	}

	async function fetchChannelSelected(idChannel : Number) {
		const old = channelSelected.id;
		await getChannelSelected(idChannel);
		chatCtx.chatSocket.emit('changeWebAdminRoom', { id_old_channel: old, id_new_channel: idChannel, id_user: currentUser!.id });
		setChannelIsSelected(true);
		setShowChanInfo(false);
	  }
	
	  function handleCloseChannel() {
		setChannelIsSelected(false);
		chatCtx.chatSocket.emit('leaveRoom', channelSelected.id);
		setShowChanInfo(false);
		if (new_page === true)
			return ;
	  }
	
	return(
		<Body content={ 
			<div className={classes.wrapper}>
				<div className={classes.columns}>
					<ListUsers
						users={logins.filter((user:UserFull) => (user.id !== currentUser!.id && user.login))}
						label={"USERS"}
						webAdmin={true}
						banned_user={false}
						button1={"Ban"}
						button2={"Admin"}
						function1={handleBan}
						function2={handleWebAdmin}
					/>
					<Channels 
						label={"CHANNELS"}
						channels={channels.filter((channel: ChannelFull) => (channel.channel_type !== 'pm'))}
						channelSelected={channelSelected}
						onChannelSelection={fetchChannelSelected}
						isWebAdmin={true}
						buttonLabel={"Show info"}
						showChanInfo={showChanInfo}
						logins={logins}
					/>
				</div>
				<div className={classes.columns}>
					{!channelIsSelected ? <p></p> :
						<ListChannelMembers
							members={channelSelected.members} 
							admins={channelSelected.admins}
							label={"MEMBERS OF THE CHANNEL"}
							channelSelected={channelSelected}
							owner={channelSelected.user_owner}
							isWebAdmin={true}
						/>
					}
					{!channelIsSelected ? <p></p> :
						<OwnerSection
							channelSelected={channelSelected}
							members={channelSelected.members} 
							admins={channelSelected.admins}
							logins={logins}
							isWebAdmin={true}
						/>
					}
				</div>
				<div className={classes.columns}>
        		<div className={classes.rows}>
				{!channelIsSelected || (channelSelected.channel_type === 'pm') ? <area></area> :
					<ChangeMembers 
						label={"Add new user to channel"}
						onMemberListChange={handleMemberListChange} 
						filtre={channelSelected.members.concat(channelSelected.banned).concat(logins.filter(user => !user.login))}
						buttonChoice={"big_button"}
					/>
				}
				{!channelIsSelected || !channelSelected.members.map(elem => elem.id).includes(currentUser.id) || (channelSelected.channel_type === 'pm') ? <area></area> :
					<LeaveChannel 
					onLeaving={handleLeaveChannel}
					/>
				}
				</div>
				{!channelIsSelected ? <p></p> :
					<ChannelMessages
						onCloseChannel={handleCloseChannel}
						channelSelected={channelSelected}
						blocked={logins.filter((user : UserFull) => (user.isBlockedByMe === 1))}
						isWebAdmin={true}
						logins={logins}
					/>
				}
				</div>
		 	</div>
    	}
    	/>
    )
}

export default Admin;