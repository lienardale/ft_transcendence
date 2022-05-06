import React from 'react';
import AuthChecker from "../../hook/auth-checker";
import FriendsContext from '../../hook/friend-context';
import fetchParams from '../../helpers/helperFetch';
import DeleteIcon from '@mui/icons-material/Delete';

function RemoveFriend(props: any) {
    const authCtx = React.useContext(AuthChecker);
    const friendsCtx = React.useContext(FriendsContext);

    async function handleRemoveFriend(){
        friendsCtx.removeFriend(
            props.friendStatus!.friend_id
        );
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('DELETE')
        if (params !== null) {
        await fetch(
            'http://localhost:3001/friends-list/' + props.friendStatus?.friendslist_id, params
        ).then(response => {
            if (response.ok) {
                return response.text();
            }
            return response.text().then(data => {
                throw new Error(data.message || 'Something went wrong!');
            });
        })
        .then(_response => { props.onRemoveFriend(props.friendStatus!.friend_id) })
        .catch(_error => console.error("error in remove friend request"));
        }
    }

    return (
        <div>
            <button onClick={handleRemoveFriend} title={'Unfriend'}> <DeleteIcon /></button>
        </div>
    );
}

export default RemoveFriend;