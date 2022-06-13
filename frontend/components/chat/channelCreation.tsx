import React, { useRef, Fragment } from 'react';
import { ChannelFull } from '../../api/db/types';
import fetchParams from '../../helpers/helperFetch';
import { CurrentUserContext } from '../../hook/session';
import responseHandler from '../../helpers/response-handler';
import AuthChecker from "../../hook/auth-checker";
import TextField from '@mui/material/TextField';
import PopUp from '../ui/popup';
import Button from  '../../styles/components/buttons.module.css';
import classes from '../../styles/pages/Chat.module.css';

function ChannelCreation(props: any) {
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const authCtx = React.useContext(AuthChecker);
    const [channelType, setChannelType] = React.useState("public");
    const channelName = useRef('')
    const channelPwd = useRef('')
    const [open, setOpen] = React.useState(false);
    const [nameError, setNameError] = React.useState(false);
    const [textError, setTextError] = React.useState('');
    let mounted :boolean = true;

    async function handleSubmit() {
        if (channelName.current.value.length === 0) {
            setNameError(true);
            setTextError('Channel name cannot be empty');
            return ;
        }
        let channelFound :ChannelFull[]  = props.channels.filter((channel :ChannelFull) => (channel.channel_type === channelType && channel.name === channelName.current.value));
        if (channelFound.length !== 0) {
            setNameError(true);
            setTextError('Channel name already exists !');
        } 
        else if (channelName.current.value) {
            await authCtx.authCheck(localStorage.getItem("currentUser"));
            let params = await fetchParams('POST',
                { channel_type: channelType, name: channelName.current.value, id_pm: 0, hasPassword: (channelPwd.current.value !== ''), password : channelPwd.current.value, user_owner: currentUser!.id }
            );
            if (params !== null) {
                fetch('/api/channels', params)
                .then(response => responseHandler(response))
                .then(response => { 
                    if (mounted) { 
                        props.onChannelSelection(response.id) 
                    }
                    else {
                        return ;
                    }
                })
                .catch(_error => console.error("error in channel creation"));
            }
            setOpen(false);
        }
    }

    function handleChannelCreation() {
        setNameError(false);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    };

    React.useEffect(() => {
        return () => {
            mounted = false;
        }
    }, []);

    return (
        <Fragment>
        {(!props.channels) ? <p></p> :
            <div className={classes.justif}>
                <button 
                    className={Button.big_button}
                    onClick={(e) => {
                        e.preventDefault();
                        handleChannelCreation();
                    }}
                >Create new channel</button>
                <PopUp
                    title={'Create a new channel'}
                    submit={'Create'}
                    onSubmit={handleSubmit}
                    onClose={handleClose}
                    open={open}
                >
                    <div className={classes.nextto}>
                        <div>Type of channel :&emsp;&emsp;&ensp;&emsp;&emsp;</div>
                        <div>  
                            <select 
                                className={Button.button_select_popup}
                                value={channelType} 
                                onChange={e => setChannelType(e.target.value)}
                            >
                                <option value="public">public</option>
                                <option value="private">private</option>
                            </select>
                        </div>
                    </div>
                    <TextField
                        margin="dense"
                        id="name"
                        label="Channel name"
                        required minLength="1"
                        type="string"
                        variant="standard"
                        inputRef={channelName}
                        error={nameError}
                        helperText={nameError === true ? textError : ''}
                        autoComplete="off"
                    />
                    <TextField
                        margin="dense"
                        id="pwd"
                        label="Password"
                        type="password"
                        variant="standard"
                        inputRef={channelPwd}
                        autoComplete="off"
                    />
                </PopUp>
            </div>
        }
        </Fragment>
    );
}

export default ChannelCreation;
