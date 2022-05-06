import React from "react";
import { Link } from 'react-router-dom';
import ContactPage from '@mui/icons-material/ContactPage';
import RemoveFriend from "../friends/RemoveFriend";

function FriendItem(props : any){

  function handleFriendRequest(id : number){
    props.onFriendRequest(id)
  }

  return (
    <div className="friend_item">
      { props.item ?
        <div className="friend_item">
            <div className="avatar_small">
                <img src={props.item.friend_avatar_path || '/images/default_user.jpg'} alt="Friend picture" layout="fill" />
            </div>
            <h3>login : {props.item.friend_login}</h3>
            <Link to={`/users/${props.item.friend_id}`} className="btn btn-sm btn-primary mr-1">
              <ContactPage/>
            </Link> 
            <div className="avatar_small">
              {props.item.friend_status === 'CONNECTED' ? 
                <img src='/images/connected.png' title='connected' /> : <area></area> }
              {props.item.friend_status === 'GAMING' ? 
                <img src='/images/playing.png' title='playing' /> : <area></area> }
              {props.item.friend_status === 'SEARCHING' ? 
                <img src='/images/searching.png' title='searching for a game' /> : <area></area> }
              {props.item.friend_status === 'AWAY' ? 
                <img src='/images/away.png' title='away' /> : <area></area> }
            </div>
            <RemoveFriend 
                onRemoveFriend={handleFriendRequest}
                friendStatus={props.item}/>
            </div>
            :
        <div></div>
        }
    </div>
  );
}

export default FriendItem;
