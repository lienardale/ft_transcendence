import { UserType } from "../../api/db/types";
import React from "react";
import { Link } from 'react-router-dom';

function ProfileItem(user: UserType){

    return (
        <div>
            <div className="avatar">
                <img src={user.avatar_path || '/images/default_user.jpg'} alt="profile picture" layout="fill" />
            </div>
            <div className="card">
                <h3>login : {user.login}</h3>
                <h3>email : {user.email} </h3>
                <Link to={`/users/${user.id}`} className="btn btn-sm btn-primary mr-1">See profile</Link>
            </div>
        </div>
    );
}

export default ProfileItem;
