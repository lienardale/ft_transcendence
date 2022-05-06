import { AskList } from "../../api/db/types";
import AskItem from "./AskItem";
import styles from "./AskList.module.css"

function AskList(props : any){

    function handleFriendRequest(id : number){
        props.onFriendRequest(id)
    }

    if (props.items === null || props.items == undefined)
    {
        return <div className={"list_block"}>
        <div className={"list_block_small"}>
            <h2 className={styles.list_tittle}> Invites </h2>
        </div>
        </div>
    }
    else {
        return  <div className={"list_block"}>
            <div className={"list_block_small"}>
            <h2 className={styles.list_tittle}> Invites </h2>
                {props.items.map((item : AskList) => (
                <li key={item.id} className={"list_block_li2"}>
                    <AskItem 
                        item={item}
                        onFriendRequest={handleFriendRequest}
                        />
                </li>
                ))}
            </div>
        </div>
    }
}

export default AskList;