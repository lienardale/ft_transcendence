import React from 'react';
import Button from '../../styles/components/buttons.module.css';
import classes from '../../styles/pages/Chat.module.css';

function LeaveChannel(props: any) {

    function handleLeaveChannel(event) {
        event.preventDefault();
        props.onLeaving();
    }

    return (
        <div className={classes.justif}>
            {props.channelIsPM ? <area></area> : 
                <button 
                    className={Button.big_button} 
                    onClick={handleLeaveChannel}
                >Leave channel</button>
            }
        </div>
    );
}

export default LeaveChannel;