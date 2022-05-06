import { UserType } from "../../api/db/types";
import React from "react";
import { Link } from 'react-router-dom';
import ContactPage from '@mui/icons-material/ContactPage';
import AcceptFriendRequest from "../friends/AcceptFriendRequest";
import DenyFriendRequest from "../friends/DenyFriendRequest";

function AskItem(props : any){
  let user_asked : UserType = props.item.user_asked;
  let user_asking : UserType = props.item.user_asking;

  function handleFriendRequest(id : number){
    props.onFriendRequest(id)
  }
  return (
      <div className="friend_item">
          { props.item ?
        <div className="friend_item">
              <div className="avatar_small">
                  <img src={user_asking.avatar_path || '/images/default_user.jpg'} alt="Ask picture" layout="fill" />
              </div>
              <h3>login : {user_asking.login} </h3>
              <Link to={`/users/${user_asking.id}`} className="btn btn-sm btn-primary mr-1">
                <ContactPage/>
              </Link>
              <AcceptFriendRequest 
                currentUser={user_asked}
                loadedUser={user_asking}
                onAcceptFriendRequest={handleFriendRequest}
                friendList={props.item}
              /> 
              <DenyFriendRequest 
                currentUser={user_asked}
                loadedUser={user_asking}
                onDenyFriendRequest={handleFriendRequest}
                friendList={props.item}
              />
          </div>
          :
          <div></div>
          }
      </div>
  );
}

export default AskItem;