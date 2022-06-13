import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@mui/material';
import fetchParams from '../../helpers/helperFetch';
import responseHandler from '../../helpers/response-handler';
import AuthChecker from "../../hook/auth-checker";
import classes from '../../styles/components/searchBox.module.css';
import { styled } from '@mui/material/styles';
import muiTheme from './paletteMui';
import { UserType } from '../../api/db/types';

function SearchBox(props: any) {
    const [logins, setLogins] = React.useState([]);
    const [input, setInput] = React.useState([]);
    const authCtx = React.useContext(AuthChecker);

    async function refreshLogins() {
        await authCtx.authCheck(localStorage.getItem("currentUser"));
        if (localStorage.getItem('currentUser') !== null) {
            const filtreId = props.filtre.map((elem) => (elem.id));
            const params = await fetchParams('GET');
            if (params !== null) {
                fetch('/api/users', params)
                .then(response => responseHandler(response))
                .then(userList => {
                    const loginList = userList
                    .filter((elem:UserType) => !filtreId.includes(elem.id) && elem.login)
                    setLogins(loginList);
                })
                .catch(_error => console.error("error in search box"));
            }
        }
    }

    function handleClick(event:any) {
        event.preventDefault();
        if (input !== null) {
            props.onUserSelection(input);
        }
    }

    function handleOpen() {
       refreshLogins();
    }

    const CssTextField = styled(TextField)({
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: muiTheme.field,
            },
            '&:hover fieldset': {
                borderColor: muiTheme.field,
            },
            '&.Mui-focused fieldset': {
                borderColor: muiTheme.field,
            },
            height: '48px',
            width: '120px',
        },
    });

    return (
        <div className={classes.box}>
            <Autocomplete  
            className={classes.root}
            options={logins}
            getOptionLabel={option => option.login}
            size='small'
            id="search-user"
            autoComplete={true}
            onOpen={handleOpen}
            clearOnEscape={true}
            renderInput={params => (
                <CssTextField 
                    {...params}
                    label="Search User"
                    variant="outlined"
                />
            )}
            onChange={(event, value) => {
                setInput(value);
                if (!props.searchBoxSelectionButton) {
                    props.onUserSelection(value);
                }
            }}
            />
            {!props.searchBoxSelectionButton ? <p></p> : <button 
                className={classes.button}
                onClick={handleClick}
            >{props.label}</button>}
        </div>
    );
}

export default SearchBox;
