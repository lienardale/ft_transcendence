import { UserType } from "../../api/db/types";
import FriendItem from "./FriendItem";
import styles from "./FriendList.module.css"

function FriendList(props : any){
    
    function handleFriendRequest(id : number){
        props.onFriendRequest(id)
    }

    if (props.items === null || props.items == undefined)
    {
        return <div className={"list_block"}>
            <div className={"list_block_small"}>
                <h2 className={styles.list_tittle}> Friends </h2>
            </div>
        </div>
    }
    else {
        return <div className={"list_block"}>
            <div className={"list_block_small"}>
                <h2 className={styles.list_tittle}> Friends </h2>
                {props.items.map((item : UserType) => (
                    <li key={item.friendslist_id} className={"list_block_li2"}>
                        <FriendItem 
                            item={item}
                            onFriendRequest={handleFriendRequest}
                        />
                    </li>
                ))}
            </div>
        </div>
    }
}

export default FriendList;