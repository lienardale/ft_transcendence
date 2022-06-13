import React from 'react';
import AuthChecker from "../../hook/auth-checker";
import FriendsContext from '../../hook/friend-context';
import fetchParams from '../../helpers/helperFetch';

function UnBlockUser(props:any){
    const authCtx = React.useContext(AuthChecker);
    const friendsCtx = React.useContext(FriendsContext);

    async function handleUnBlockUser(){
        friendsCtx.unBlockUser(props.loadedUser!.id);
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('DELETE')
        if (params !== null){
            fetch(
                '/api/blocked-list/' + props.blockList!.id, params
            )                .then(response => {
                if (response.ok) {
                    return response.text();
                }
                return response.text().then(data => {
                    throw new Error(data.message || 'Something went wrong!');
                });
            })
            .then(_response => { props.onUnBlockUser(props.loadedUser!.id) })
            .catch(_error => console.error("error in unblock user request"));
          }
    }

    return (
        <div>
            <button onClick={handleUnBlockUser} title={'Unblock user'}> {'Unblock User'}</button>
        </div>
    );
}
export default UnBlockUser;
