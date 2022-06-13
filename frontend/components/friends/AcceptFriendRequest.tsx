import React from 'react';
import AuthChecker from "../../hook/auth-checker";
import FriendsContext from '../../hook/friend-context';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import fetchParams from '../../helpers/helperFetch';

function AcceptFriendRequest(props: any) {
    const authCtx = React.useContext(AuthChecker);
    const friendsCtx = React.useContext(FriendsContext);

    async function handleAcceptFriendRequest(){
        friendsCtx.acceptFriend(
            props.loadedUser!
        );
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('PATCH', {
            "friendship_status": "accepted"
        })
        if (params !== null) {
            fetch(
              '/api/friends-list/' + props.friendList!.id, params)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    return response.text().then(data => {
                        throw new Error(data.message || 'Something went wrong!');
                    });
                })
                .then(_response => { props.onAcceptFriendRequest(props.loadedUser!.id) })
                .catch(_error => console.error("error in accept friend request"));
        }
    }
        // chatCtx.chatSocket.emit('newFrienRequestToServer', { id_user_asking : props.loadedUser!.id , id_user_asked: currentUser!.id })
    return (
        <div>
            <button onClick={handleAcceptFriendRequest}> <DoneOutlineIcon/></button>
        </div>
    );
}

export default AcceptFriendRequest;
