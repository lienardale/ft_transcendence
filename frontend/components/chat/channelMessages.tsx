import React, { Fragment }  from 'react';
import fetchParams from '../../helpers/helperFetch';
import responseHandler from '../../helpers/response-handler';
import { CurrentUserContext } from '../../hook/session';
import AuthChecker from "../../hook/auth-checker";
import classes from '../../styles/pages/Chat.module.css';
import classesFlex from '../../styles/pages/ChatFlex.module.css';
import chanClass from '../../styles/components/selectedChannel.module.css';
import Button from '../../styles/components/buttons.module.css';
import { ChannelSelected, MuteList,UserFull } from '../../api/db/types';
import { ChatSocketContext } from "../../hook/chat-socket";

function ChannelMessages(props: any) {
    const chatCtx = React.useContext(ChatSocketContext);
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const authCtx = React.useContext(AuthChecker);
    const [input, setInput] = React.useState('');
    const [name, setName] = React.useState('');
    const [isMute, setIsMute] = React.useState(false);
    let mutetime: Date;
    let date: Date;
    let mounted :boolean = true;   

    function getChannelName(channel : ChannelSelected) {
        let other : UserFull;

        if (channel.channel_type === "pm" && props.logins) {
            if (channel.user_owner.id === currentUser.id) {
                other = props.logins.find((e: UserFull) => (e.id === channel.id_pm));
            }
            else {
                other = props.logins.find((e: UserFull) => (e.id === channel.user_owner.id));
            }
            if (other !== undefined) {
                return (other.login);
            }
            else {
                return (channel.name);   
            }
        }
        else {
            return (channel.name)
        }
    }

    React.useLayoutEffect(() => {
        setName(getChannelName(props.channelSelected));
        setIsMute(false);
        date = new Date();
        props.channelSelected.mute.forEach((elem: MuteList) => {
            if (elem.user.id === currentUser.id) {
                mutetime  = new Date(elem.unmutetime);
                if (mutetime > date) {
                    setIsMute(true);
                }
            }
        });
        return () => {
            mounted = false;
        }
    }, [props.channelSelected]);

    async function handleSubmitMsg(event) {
        event.preventDefault();
        if (input.length !== 0) {
            await authCtx.authCheck(localStorage.getItem("currentUser"));
            const date = new Date().toUTCString();
            let params = await fetchParams('POST',
                { content: input, datetime: date, user_writer: currentUser, channel_related: props.channelSelected.id }
            );
            if (params !== null) {
                fetch('/api/messages', params)
                    .then(response => responseHandler(response))
                    .then(response => chatCtx.chatSocket.emit('msgToServer', {content: JSON.stringify(response), room: props.channelSelected.id}))
                    .catch(_error => console.error("error in channel messages"));
            }
            if (mounted) {
                setInput('');
            }
        }
    }

    function seeMessage(message) {
        if (!(props.blocked.some((user : UserFull) => (user.id === message.user_writer.id)))) {
            return (
                <li key={message.id}>
                    <div className={classes.green}>{message.user_writer.login} : </div> 
                    <div>{message.content}</div>
                </li>
            )
        }
    }

    function handleClose(event) {
        event.preventDefault();
        props.onCloseChannel();
    }

    return (
        <Fragment>
        {(!props.channelSelected) ? <p></p> :
            <div className={classesFlex.rows}>
                {props.channelSelected.messages === null ? <area></area> :
                    <div className={classes.list_block}>
                        <div className={chanClass.selected_channel_height}>
                            <p className={chanClass.selected_channel}>
                                {name}
                                <button 
                                    className={Button.button_small} 
                                    title="Close"
                                    onClick={handleClose}
                                >X</button>
                            </p>
                            <div className={chanClass.selected_channel_msg}>
                                <ul> {props.channelSelected.messages.map((message) => (
                                    seeMessage(message)
                                ))}
                                </ul>
                            </div>
                            <div className={chanClass.selected_channel_bottom}>
                                {isMute && !props.isWebAdmin ? <p>No messages for 1 hour</p> :
                                    <form onSubmit={handleSubmitMsg}>
                                        <input value={input} onInput={e => setInput(e.target.value)} />
                                        <input type="submit" value="Send" />
                                    </form>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        }
        </Fragment>
    );
}

export default ChannelMessages;
