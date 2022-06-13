import React, { useRef } from 'react';
import fetchParams from '../../helpers/helperFetch';
import AuthChecker from "../../hook/auth-checker";
import responseHandler from '../../helpers/response-handler';
import TextField from '@mui/material/TextField';
import PopUp from '../ui/popup';
import Button from '../../styles/components/buttons.module.css';

function ChangePassword(props: any) {
    const authCtx = React.useContext(AuthChecker);
    const newPwd = useRef('');
    const oldPwd = useRef('');
    const changedPwd = useRef('');
    const [openAdd, setOpenAdd] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [passwordError, setpasswordError] = React.useState(false);
    const [channelCandidate, setchannelCandidate] = React.useState(0);
    const [NewPwdError, setNewPwdError] = React.useState(false);

    async function checkPassword(): Promise<boolean> {
        let checkSucceeded: boolean = false;

        if (oldPwd.current.value.length !== 0) {
            authCtx.authCheck(localStorage.getItem("currentUser"));
            const params = await fetchParams('POST', { code: oldPwd.current.value, channelId: channelCandidate.id } );
            let result :boolean  = false;
            if (params !== null) {
                await fetch("/api/channels/check-password", params)
                .then(response => responseHandler(response))
                .then((response) => { result = response.result })
                .catch(_error => { result = false });
            }

            if (result) {
                checkSucceeded = true;
            }
        }
        return checkSucceeded;
    }

    async function submitPwd(pwd: string, hasPwd: boolean) {
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        const url = '/api/channels/' + props.channelSelected.id;
        let params = await fetchParams('PATCH', { 
                channel_type: props.channelSelected.channel_type, 
                name: props.channelSelected.name, 
                hasPassword: hasPwd,
                password : pwd, 
                user_owner: props.channelSelected.user_owner.id
            }
        );
        if (params !== null) {
            fetch(url, params)
            .then(response => responseHandler(response))
            .then(response => { props.onPasswordChange(response) })
            .catch(error => console.error("error : ", error));
        }
    }

    async function handleSubmit() {
        setNewPwdError(false);
        if (newPwd.current.value.length !== 0) {
            await submitPwd(newPwd.current.value, true);
            setOpenAdd(false);
        } else {
            setNewPwdError(true);
        }
    }

    async function handleSubmit2() {
        setNewPwdError(false);
        if (changedPwd.current.value.length !== 0) {
            await submitPwd(changedPwd.current.value, true);
            setOpen2(false);
        } else {
            setNewPwdError(true);
        }
    }

    async function handleRemove(): Promise<void> {
        if (props.isWebAdmin || await checkPassword()) {
            await submitPwd("", false);
            if (props.isWebAdmin) {
                setOpen2(false);
            }
            else {
                setOpen1(false);
            }
        } else {
            setpasswordError(true);
        }
    }

    const handleCloseAdd = () => {
        setOpenAdd(false);
    };

    const handleClose1 = () => {
        setOpen1(false);
    };

    const handleClose2 = () => {
        setOpen2(false);
    };

    async function handleValidate(): Promise<void> {
        if (await checkPassword()) {
            setOpen1(false);
            setOpen2(true);
        } else {
            setpasswordError(true);
        }
    };

    async function handleAdd() {
        setchannelCandidate(props.channelSelected);
        setOpenAdd(true);
    }

    async function handleChange() {
        setchannelCandidate(props.channelSelected);
        if (props.isWebAdmin)
        {
            setOpen2(true);
        }
        else
        {
            setpasswordError(false);
            setOpen1(true);
        }
    }

    return (
        <div>
            {props.channelSelected.hasPassword ?
                <p>
                    Change or remove the channel's password
                    <button 
                        className={Button.button_simple}
                        onClick={handleChange}
                    >
                        Change
                    </button>
                </p>
            : 
            <div>
                <p>
                    Add a password
                    <button 
                        className={Button.button_simple}
                        onClick={handleAdd}
                    >
                        Add
                    </button>
                </p>
            </div>
            }
            <PopUp
                title={'Add a new password'}
                context={'Type your new password :'}
                onSubmit={handleSubmit}
                submit={'Add'}
                onClose={handleCloseAdd}
                open={openAdd}
            >
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Password"
                    type="password"
                    variant="standard"
                    inputRef={newPwd}
                    error={NewPwdError}
                    helperText={NewPwdError === true ? 'Password field cannot be empty' : ''}
                    autoComplete="off"
                    required minLength="1"
                />
            </PopUp>
            <PopUp
                title={'Channel Protected by Password'}
                context={'To change or remove the password, please type the current one :'}
                onSubmit={handleValidate}
                submit={'Change'}
                onOther={handleRemove}
                other={'Remove'}
                onClose={handleClose1}
                open={open1}
            >
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    inputRef={oldPwd}
                    error={passwordError}
                    helperText={passwordError ? 'Incorrect Password!' : ' '}
                    autoComplete="off"
                />
            </PopUp>
            <PopUp
                title={'Channel Protected by Password'}
                context={props.isWebAdmin ? 'Type your new password or remove it :' : 'Type your new password :'}
                onSubmit={handleSubmit2}
                submit={'Confirm'}
                onOther={props.isWebAdmin ? handleRemove : ''}
                other={props.isWebAdmin ? 'Remove' : ''}
                onClose={handleClose2}
                open={open2}
            >
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    inputRef={changedPwd}
                    autoComplete="off"
                    error={NewPwdError}
                    helperText={NewPwdError === true ? 'Password field cannot be empty' : ''}
                    required minLength="1"
                />
            </PopUp>
        </div>
    );
}

export default ChangePassword;
