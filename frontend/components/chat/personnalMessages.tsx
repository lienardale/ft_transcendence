import React, { Fragment } from 'react';
import { CurrentUserContext } from '../../hook/session';
import SearchBox from '../ui/searchBox';
import Button from '../../styles/components/buttons.module.css';
import PopUp from '../ui/popup';
import classes from '../../styles/pages/Chat.module.css';
import { UserType, ChannelFull } from '../../api/db/types';

function PersonnalMessages(props: any) {
    const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
    const [open, setOpen] = React.useState(false);
    let input: UserType;
    let mounted :boolean = true;    

    function handleUserSelection(value: UserType) {
        input = value;
    }

    async function handleSubmitPM() {
        if (input) {
            const channelFound = props.myChannels.find((e : ChannelFull) => (e.userOwnerId === input.id && e.id === currentUser.id && e.channel_type === 'pm') || (e.userOwnerId === currentUser.id && e.id_pm === input.id && e.channel_type === 'pm'));
            if (channelFound === undefined) {
                await props.onChannelPMCreation(input);
            }
            else {
                await props.onChannelSelection(channelFound.id);
            }
            if (mounted) {
                setOpen(false);
            }
        }
    }

    function handleOpen() {
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
        {!props.myChannels ? <p></p> :
            <div className={classes.justif}>
                <button 
                    className={Button.big_button}
                    onClick={(e) => {
                        e.preventDefault();
                        handleOpen();
                    }}
                >
                    Create new PM
                </button>
                <PopUp
                    title={'Start private conversation'}
                    submit={'Talk'}
                    onSubmit={handleSubmitPM}
                    onClose={handleClose}
                    open={open}
                >
                    {currentUser && <SearchBox 
                        label={"Talk"}
                        onUserSelection={handleUserSelection}
                        searchBoxSelectionButton={false}
                        filtre={props.filtre}
                    />}
                </PopUp>
            </div>
        }
        </Fragment>
    );
}

export default PersonnalMessages;