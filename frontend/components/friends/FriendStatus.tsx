import React, { useState } from "react";
import { FriendItem, AskList, BlockList } from '../../api/db/types';
import { CurrentUserContext } from '../../hook/session';
import UnBlockUser from "../blocked/UnBlockUser";
import AcceptFriendRequest from "../friends/AcceptFriendRequest";
import DenyFriendRequest from "../friends/DenyFriendRequest";
import RemoveFriend from "./RemoveFriend";
import CancelAskFriend from "./CancelAskFriend";
import AskFriend from "./AskFriend";
import BlockUser from "../blocked/BlockUser";

function FriendStatus( props : any){

  const [friendStatus, setFriendStatus] = useState<FriendItem | undefined>();
  const [friendList, setFriendList] = useState<AskList | undefined>();
  const [blockList, setBlockList] = useState<BlockList | undefined>();

  const [status, setStatus] = useState<string>('nothing'); 

  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const [mounted, setMounted] = React.useState<Boolean>(true);

  let friend_status;

  React.useEffect(()=>{
    if (props.blocked && props.blocked.some(user => user.user_blocked.id === props.loadedUser.id)){
      if (mounted === true){
        setStatus('blocking')
        setBlockList(props.blocked.find(user => user.user_blocked.id === props.loadedUser.id))
      }
    }
    else if(props.friends && props.friends.some(user => user.friend_id === props.loadedUser.id)){
      if (mounted === true){
        setStatus('friend')
        setFriendStatus(props.friends.find(user => user.friend_id === props.loadedUser.id))
      }
    }
    else if (props.asked && props.asked.some(list => list.user_asked.id === props.loadedUser.id)){
      if (mounted === true){
        setStatus('asked')
        setFriendList(props.asked.find(list => list.user_asked.id === props.loadedUser.id))
      }
    }
    else if (props.asking && props.asking.some(list => list.user_asking.id === props.loadedUser.id)){
      if (mounted === true){
        setStatus('asking')
        setFriendList(props.asking.find(list => list.user_asking.id === props.loadedUser.id))
      }
    }
    else{
      if (mounted === true)
        setStatus('nothing')
    }
    return () => {}
}, [props.blocked, props.friends, props.asking, props.asked, props.loadedUser]);

  function handleFriendRequest(id : number){
    props.onFriendRequest(id)
  }

  if (status === 'blocking'){
    friend_status = <UnBlockUser 
    currentUser={currentUser!}
      loadedUser={props.loadedUser}
      onUnBlockUser={handleFriendRequest}
      blockList={blockList}
    />
  } else {
    if (status === 'asking'){
        friend_status = <div>
          <AcceptFriendRequest 
            currentUser={currentUser!}
            loadedUser={props.loadedUser}
            onAcceptFriendRequest={handleFriendRequest}
            friendList={friendList}
          /> 
          <DenyFriendRequest 
            currentUser={currentUser!}
            loadedUser={props.loadedUser}
            onDenyFriendRequest={handleFriendRequest}
            friendList={friendList}
          />
        </div>
    } else if (status === 'friend') {
        friend_status = <RemoveFriend 
        currentUser={currentUser!}
        loadedUser={props.loadedUser}
        onRemoveFriend={handleFriendRequest}
        friendStatus={friendStatus}
      />
    } else if (status === 'asked'){
      friend_status = <CancelAskFriend 
      currentUser={currentUser!}
      loadedUser={props.loadedUser}
      onCancelAskFriend={handleFriendRequest}
      friendList={friendList}
    />
    } else {
      friend_status = <div>
        <AskFriend 
          currentUser={currentUser!}
          loadedUser={props.loadedUser}
          onAskFriend={handleFriendRequest}
          friendList={friendList}
        /> 
        <BlockUser 
          currentUser={currentUser!}
          loadedUser={props.loadedUser}
          onBlockUser={handleFriendRequest}
          blockList={blockList}
        /> 
      </div>
    }
  }
  return friend_status;

}
export default FriendStatus;