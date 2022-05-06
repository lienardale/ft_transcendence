import React from 'react';
import AuthChecker from "../../hook/auth-checker";
import FriendsContext from '../../hook/friend-context';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import fetchParams from '../../helpers/helperFetch';

function DenyFriendRequest(props: any) {
    const authCtx = React.useContext(AuthChecker);
    const friendsCtx = React.useContext(FriendsContext);

    async function handleDenyFriendRequest(){
        friendsCtx.denyRequest(
            props.loadedUser!.id
        );
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('DELETE')
        if (params !== null) {
            fetch(
                'http://localhost:3001/friends-list/' + props.friendList!.id, params)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    return response.text().then(data => {
                        throw new Error(data.message || 'Something went wrong!');
                    });
                })
                .then(_response => { props.onDenyFriendRequest(props.loadedUser!.id) })
                .catch(_error => console.error("error in deny friend request"));
        }
    }
    return (
        <div>
            <button onClick={handleDenyFriendRequest} title={'Deny friend request'}> <DoDisturbIcon/></button>
        </div>
    );
}

export default DenyFriendRequest;