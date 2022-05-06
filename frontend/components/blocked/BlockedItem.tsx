import React from "react";
import { Link } from 'react-router-dom';
import styles from "./BlockItem.module.css"
import ContactPage from '@mui/icons-material/ContactPage';
import UnBlockUser from "../blocked/UnBlockUser";

function BlockedItem(props: any){

    function handleFriendRequest(id : number){
        props.onFriendRequest(id)
    }

    return (
        <div>
            { props.item ?
                <div className={styles.card}>
                    <div className="avatar_small">
                        <img src={props.item.user_blocked.avatar_path || '/images/default_user.jpg'} alt="Blocked picture" layout="fill" />
                    </div>
                    <h3>{props.item.user_blocked.login}</h3> 
                    <Link to={`/users/${props.item.user_blocked.id}`} className="btn btn-sm btn-primary mr-1">
                        <ContactPage/>
                    </Link> 
                    <UnBlockUser 
                        loadedUser={props.item}
                        onUnBlockUser={handleFriendRequest}
                        blockList={props.item}
                    />
                </div>
            :
                <div></div>
            }
        </div>
    );
}

export default BlockedItem;
