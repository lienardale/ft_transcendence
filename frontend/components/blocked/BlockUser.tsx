import React from 'react';
import AuthChecker from "../../hook/auth-checker";
import FriendsContext from '../../hook/friend-context';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import fetchParams from '../../helpers/helperFetch';

function BlockUser(props: any){
    const authCtx = React.useContext(AuthChecker);
    const friendsCtx = React.useContext(FriendsContext);

    async function handleBlockUser(){
        friendsCtx.blockUser(props.loadedUser!);
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('POST', {
              "user_blocking": props.currentUser!.id,
              "user_blocked": props.loadedUser!.id
          })
          if (params !== null) {
            fetch(
                '/api/blocked-list', params
            ).then(response => {
                if (response.ok) {
                    return response.text();
                }
                return response.text().then(data => {
                    throw new Error(data.message || 'Something went wrong!');
                });
            })
            .then(_response => { props.onBlockUser(props.loadedUser!.id) })
            .catch(_error => console.error("error in block User request"));
          }
    }
    return (
        <div>
            <button onClick={handleBlockUser} title={'Block user'}> <PersonOffIcon/></button>
        </div>
    )
}

export default BlockUser;
