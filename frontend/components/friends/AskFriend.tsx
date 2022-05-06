import React from 'react';
import AuthChecker from "../../hook/auth-checker";
import FriendsContext from '../../hook/friend-context';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import fetchParams from '../../helpers/helperFetch';

function AskFriend(props: any) {
    const authCtx = React.useContext(AuthChecker);
    const friendsCtx = React.useContext(FriendsContext);

    async function handleAskFriend(event){
        friendsCtx.askFriend(props.loadedUser!)
        event.preventDefault();
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const params = await fetchParams('POST', {
              "friendship_status": "not_accepted",
              "user_asking": props.currentUser!.id,
              "user_asked": props.loadedUser!.id
          })
          if (params !== null) {
            fetch(
                'http://localhost:3001/friends-list', params
            )
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                return response.text().then(data => {
                    throw new Error(data.message || 'Something went wrong!');
                });
            })
            .then(_response => { props.onAskFriend(props.loadedUser!.id) })
            .catch(_error => console.error("error in ask friend request"));
        }
    }
    return (
        <div>
            <button onClick={handleAskFriend} title={'Ask as a friend'}> <PersonAddIcon/></button>
        </div>
    );
}

export default AskFriend;