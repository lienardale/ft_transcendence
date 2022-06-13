import React, { useRef, Fragment }  from 'react';
import AuthChecker from "../../hook/auth-checker";
import fetchParams from '../../helpers/helperFetch';
import { CurrentUserContext } from '../../hook/session';
import { ChannelFull,UserFull} from '../../api/db/types';
import TextField from '@mui/material/TextField';
import PopUp from '../ui/popup';
import Button from '../../styles/components/buttons.module.css';
import classes from '../../styles/pages/Chat.module.css';
import responseHandler from '../../helpers/response-handler';

function Channels(props: any) {
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const [open, setOpen] = React.useState(false);
    const valueRef = useRef('')
    const [channelCandidate, setchannelCandidate] = React.useState(0);
    const [passwordError, setpasswordError] = React.useState(false);
    const authCtx = React.useContext(AuthChecker);
    let mounted :boolean = true;    
  
    const handleClickOpen = (channel : ChannelFull) => {
        setchannelCandidate(channel);
        setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
    
    async function handleJoin() {
        setpasswordError(false);

        if (valueRef.current.value.length != 0) {
            authCtx.authCheck(localStorage.getItem("currentUser"));
            const params = await fetchParams('POST', { code: valueRef.current.value, channelId: channelCandidate.id } );
            let result :boolean  = false;
            if (params !== null) {
                await fetch("/api/channels/check-password", params)
                .then(response => responseHandler(response))
                .then((response) => { 
                    if (mounted) { 
                        result = response.result
                    }
                    else {
                        return ;
                    }
                })
                .catch(_error => { result = false });
            }
            
            if (result) {
                setOpen(false);
                props.onChannelSelection(channelCandidate.id);
            }
            else {
                setpasswordError(true);
            }
        }
    };

    function getChannelName(channel : ChannelFull) {
        let other : UserFull;

        if (channel.channel_type === "pm" && props.logins) {
            if (channel.userOwnerId === currentUser.id) {
                other = props.logins.find((e: UserFull) => (e.id === channel.id_pm));
            }
            else {
                other = props.logins.find((e: UserFull) => (e.id === channel.userOwnerId));
            }
            if (other !== undefined) {
                return (other.login);
            }
            else {
                return (channel.name);   
            }
        }
        return (channel.name)
    }

    async function handleChannelSelected(channel: ChannelFull) {
        if (!props.isWebAdmin && channel.hasPassword) {
            handleClickOpen(channel);
        }
        else {
            if (!props.showChanInfo)
                await props.onChannelSelection(channel.id);
            else
                await props.onChannelSelection(0);
        }
    }

    React.useEffect(() => {
        return () => {
            mounted = false;
        }
    }, []);

    return (
        <Fragment>
        {!props.channels ? <p></p> :
            <div className={classes.list_block}>
                <div className={classes.list_block_small}>
                <p>{props.label}</p>
                <ul> {props.channels.map((channel :ChannelFull) => (
                    <li key={channel.id} className={classes.list_block_li2}>
                        {getChannelName(channel)}
                        <button 
                            className={Button.button_simple} 
                            onClick={(e) => {
                                e.preventDefault();
                                handleChannelSelected(channel);
                            }}
                        >{props.buttonLabel}</button>
                    </li>
                    ))} 
                </ul>
                <PopUp
                    title={'Channel Protected by Password'}
                    context={'To join this channel, please type its password :'}
                    submit={'Join'}
                    onSubmit={handleJoin}
                    onClose={handleClose}
                    open={open}
                >
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"
                        inputRef={valueRef}
                        error={passwordError}
                        helperText={passwordError ? 'Incorrect Password!' : ' '}
                        autoComplete="off"
                    />
                </PopUp>
                </div>
            </div>
        }
        </Fragment>
    );
}

export default Channels;
