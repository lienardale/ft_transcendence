import React, { Fragment } from 'react';
import SearchBox from '../ui/searchBox';
import PopUp from '../ui/popup';
import ButtonChoice from '../ui/button_choice';
import classes from '../../styles/pages/Chat.module.css';

function ChangeMembers(props: any) {
    const [open, setOpen] = React.useState(false);
    let input = '';

    function handleUserSelection(value) {
        input = value;
    }

    function handleChange() {
        if (input !== '') {
            props.onMemberListChange(input.id);
            setOpen(false);
        }
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Fragment>
        {(!props.filtre) ? <p></p> :
            <div>
                <div className={classes.nextto} className={classes.justif}>
                    {props.title}
                    <ButtonChoice
                        onClick={handleOpen}
                        label={props.label}
                        choice={props.buttonChoice}
                    />
                </div>
                <PopUp
                    title={props.label}
                    submit={props.label}
                    onSubmit={handleChange}
                    onClose={handleClose}
                    open={open}
                >
                    <SearchBox 
                        label={props.label}
                        onUserSelection={handleUserSelection}
                        searchBoxSelectionButton={false}
                        filtre={props.filtre}
                    />
                </PopUp>
            </div>
        }
        </Fragment>
    );
}

export default ChangeMembers;