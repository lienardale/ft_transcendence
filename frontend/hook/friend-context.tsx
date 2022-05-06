import { createContext, useState } from "react";
import { UserType } from "../api/db/types";

const FriendsContext = createContext({
    friends: [] as UserType[],
    asked: [] as UserType[],
    asking: []as UserType[],
    blocked: []as UserType[],

    totalFriends: 0,
    totalAsked:0,
    totalAsking: 0,
    totalBlocked: 0,

    acceptFriend:(friendUser : UserType) => {},
    askFriend:(friendUser : UserType) => {},
    askingFriend: (friendUser : UserType) => {},
    blockUser: (friendUser : UserType) => {},

    removeFriend: (userId : number) => {},
    cancelRequest: (userId : number) => {},
    denyRequest: (userId : number) => {},
    unBlockUser: (userId : number) => {},

    userIsFriend: (userId : number) => Boolean(),
    userIsAsked: (userId : number) => Boolean(),
    userIsAsking: (userId : number) => Boolean(),
    userIsBlocked: (userId : number) => Boolean(),
});

export function FriendsContextProvider(props : any) {
    
    const [userFriends, setUserFriends] = useState<UserType[]>([]);
    const [userAsked, setUserAsked] = useState<UserType[]>([]);
    const [userAsking, setUserAsking] = useState<UserType[]>([]);
    const [userBlocked, setUserBlocked] = useState<UserType[]>([]);

    function acceptFriendHandler(friendUser: UserType){
        setUserFriends((prevUserFriends) => {
            return prevUserFriends.concat(friendUser);
        });
    }

    function askFriendHandler(friendUser: UserType){
        setUserAsked((prevUserAsked) => {
            return prevUserAsked.concat(friendUser);
        });
    }

    function askingFriendHandler(friendUser: UserType){
        setUserAsking((prevUserFriend) => {
            return prevUserFriend.concat(friendUser);
        });
    }

    function blockUserHandler(blockedUser: UserType){
        setUserBlocked((prevblockedUser) => {
            return prevblockedUser.concat(blockedUser);
        });
    }

    function removeFriendHandler(userId : number){
        setUserFriends(prevUserFriends =>{
            return prevUserFriends.filter(user => user.id !== userId);
        });
    }

    function cancelRequestHandler(userId : number){
        setUserAsked(prevUserRequests =>{
            return prevUserRequests.filter(user => user.id !== userId);
        });
    }

    function denyRequestHandler(userId : number){
        setUserAsking(prevUserAsking =>{
            return prevUserAsking.filter(user => user.id !== userId);
        });
    }

    function unBlockUserHandler(userId : number){
        setUserBlocked(prevblockedUser =>{
            return prevblockedUser.filter(user => user.id !== userId);
        });
    }

    function userIsFriendHandler(userId : number): boolean{
        return userFriends.some(user => user.id === userId);
    }

    function userIsAskedHandler(userId : number): boolean{
        return userAsked.some(user => user.id === userId);
    }

    function userIsAskingHandler(userId : number): boolean{
        return userAsking.some(user => user.id === userId);
    }

    function userIsBlocked(userId : number): boolean{
        return userBlocked.some(user => user.id === userId);
    }

    const context = {
        friends: userFriends,
        asked:userAsked,
        asking: userAsking,
        blocked: userBlocked,

        totalFriends: userFriends.length,
        totalAsking:userAsking.length,
        totalAsked:userAsked.length,
        totalBlocked:userBlocked.length,
        // this is a function pointer
        acceptFriend: acceptFriendHandler,
        askFriend:askFriendHandler,
        askingFriend:askingFriendHandler,
        blockUser:blockUserHandler,

        cancelRequest: cancelRequestHandler,
        denyRequest: denyRequestHandler,
        removeFriend: removeFriendHandler,
        unBlockUser: unBlockUserHandler,

        userIsAsking: userIsAskingHandler,
        userIsAsked: userIsAskedHandler,
        userIsFriend: userIsFriendHandler,
        userIsBlocked:userIsBlocked
    };
    
    return <FriendsContext.Provider value={context}>
        {props.children}
    </FriendsContext.Provider>
}

export default FriendsContext;