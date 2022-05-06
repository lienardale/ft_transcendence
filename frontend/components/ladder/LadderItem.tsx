import React from "react";
import { Link } from 'react-router-dom';
import { CurrentUserContext } from '../../hook/session';

function LadderItem(props : any){

    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;

    return (
        <div className="friend_item">
            { props.user ?
            <div className="friend_item">
                <pre>{props.user.rank} </pre>
                <div className="avatar_small">
                    <img src={props.user.user_avatar_path || '/images/default_user.jpg'} alt="Ladder picture" layout="fill" />
                </div>
                <pre> {props.user.user_login} </pre>
                {currentUser!.id !== props.user.user_id ?
                    <Link to={`/users/${props.user.user_id}`} className="btn btn-sm btn-primary mr-1"> See profile </Link>
                    :
                    <p></p>
                }
            </div>
            :
            <div></div>
            }
        </div>
    );
}

export default LadderItem;