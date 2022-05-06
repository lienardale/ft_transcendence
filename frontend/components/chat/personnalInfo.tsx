import React from 'react';
import Button from '../../styles/components/buttons.module.css';
import classes from '../../styles/pages/Chat.module.css';

function PersonnalInfo(props: any) {

    function showPersonnalInfo(event) {
        event.preventDefault();
        props.showPersInfo ? props.onShow(false) : props.onShow(true)
    }

    return (
        <div className={classes.justif}>
            {props.showPersInfo ?
                <button 
                    className={Button.big_button}
                    onClick={showPersonnalInfo}
                >
                    Hide personnal info
                </button>
            : 
                <button 
                    className={Button.big_button}
                    onClick={showPersonnalInfo}
                >
                    Show personnal info
                </button>
            }
        </div>
    );
}

export default PersonnalInfo;