import { UserType } from "../../api/db/types";
import UserItem from "./UserItem";

function UserList(props : any){
    if (props.users === undefined)
    {
        return <h3>Nothing here...yet.</h3>
    }
    else {
        return <ul>
            {props.users.map((item : UserType) => (
            <li key={item.id}>
                <UserItem {...item} />
            </li>
            ))}
        </ul>
    }
}

export default UserList;