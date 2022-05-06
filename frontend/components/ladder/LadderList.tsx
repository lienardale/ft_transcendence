import { UserType } from "../../api/db/types";
import LadderItem from "./LadderItem";
import styles from "../games/GameList.module.css"

function LadderList(props : any){
    if (props.users === undefined)
    {
        return <h3>Nothing here...yet.</h3>
    }
    else {
        return <div className={"ladder_list_block"}>
        <div className={"list_block_small"}>
        <h2 className={styles.list_tittle}> Ladder </h2>
            {props.users.map((item : any) => (
            <li key={item.user_id} className={"list_block_li2"}>
                <LadderItem user={item} />
            </li>
            ))}
        </div>
    </div>
    }
}

export default LadderList;