import React, { Fragment }  from 'react';
import { CurrentUserContext } from '../../hook/session';
import { ChatSocketContext } from "../../hook/chat-socket";
import ChangeMembers from './changeMembers';
import ChangePassword from './changePassword';
import classes from '../../styles/pages/Chat.module.css';
import { ChannelType } from '../../api/db/types';

function OwnerSection(props: any) {
    const chatCtx = React.useContext(ChatSocketContext);
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const [isOwner, setIsOwner] = React.useState();
    const [filtreAdd, setFiltreAdd] = React.useState([]);
    const [filtreRemove, setFiltreRemove] = React.useState([]);

    React.useEffect(() => {
        if (props.channelSelected.user_owner.id === currentUser.id || props.isWebAdmin) {
            setIsOwner(true);
        }
        return () => {}
    }, [props.channelSelected, props.isWebAdmin]);

    React.useEffect(() => {
        if (props.admins !== undefined && props.logins !== undefined) {
            let idAdmins = props.admins.map(elem => elem.id);
            let idMembresNonAdmins = props.members.filter(elem => !idAdmins.includes(elem.id)).map(elem => elem.id);
            setFiltreAdd(props.logins.filter(elem => !idMembresNonAdmins.includes(elem.id)));
            if (props.isWebAdmin) {
                setFiltreRemove(props.logins.filter(elem => !idAdmins.includes(elem.id)));
            } else {
                setFiltreRemove(props.logins.filter(elem => !idAdmins.includes(elem.id) || elem.id === currentUser!.id));
            }
        }
        return () => {}
    }, [props.admins, props.logins]);
  
    function handleAdd(input :Number) {
        chatCtx.chatSocket.emit('addAdmin', { id_channel: props.channelSelected.id, id_user: input }); 
    }

    function handleRemove(input :Number) {
        chatCtx.chatSocket.emit('removeAdmin', { id_channel: props.channelSelected.id, id_user: input }); 
    }

    function handleChangePassword(response : ChannelType) {
        chatCtx.chatSocket.emit('majChannelSelectedToServer', response.id);
        chatCtx.chatSocket.emit('majChannelServer');
    }

    return (
        <Fragment>
        {(!props.channelSelected || !props.admins || !props.members || !props.logins) ? <p></p> :
            <div>
                {isOwner || props.isWebAdmin ? 
                    <div className={classes.list_block}>
                        <div className={classes.list_block_small}>
                            <p>OWNER SECTION</p>
                            <div className={classes.sous_section}>
                                <ChangeMembers
                                    onMemberListChange={handleAdd} 
                                    title={"Add an administrator"}
                                    label={"Add"}
                                    filtre={filtreAdd}
                                    buttonChoice={"button_simple"}
                                />
                                <ChangeMembers
                                    onMemberListChange={handleRemove} 
                                    title={"Remove an administrator"}
                                    label={"Remove"}
                                    filtre={filtreRemove}
                                    buttonChoice={"button_simple"}
                                />
                            </div>
                            <div className={classes.sous_section}>
                                <ChangePassword
                                    onPasswordChange={handleChangePassword} 
                                    channelSelected={props.channelSelected}
                                    isWebAdmin={props.isWebAdmin}
                                />
                            </div>
                        </div>
                    </div>
                : <p></p>}
            </div>
        }
        </Fragment>
    );
}

export default OwnerSection;