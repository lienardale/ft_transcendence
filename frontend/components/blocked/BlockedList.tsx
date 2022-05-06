import { BlockList } from "../../api/db/types";
import BlockedItem from "./BlockedItem";
import styles from "./BlockList.module.css"

function BlockedList(props : any){

    function handleFriendRequest(id : number){
        props.onFriendRequest(id)
    }

    if (props.items === null || props.items === undefined)
    {
        return <div className={"list_block"}>
            <div className={"list_block_medium"}>
                <h2 className={styles.list_tittle}> Blocked </h2>
            </div>
        </div>
    }
    else {
        return <div className={"list_block"}>
            <div className={"list_block_medium"}>
            <h2 className={styles.list_tittle}> Blocked </h2>
                {props.items.map((item : BlockList) => (
                <li key={item.id} className={"list_block_li2"}>
                    <BlockedItem 
                        item={item}
                        onFriendRequest={handleFriendRequest}
                        />
                </li>
                ))}
            </div>
        </div>
    }
}

export default BlockedList;