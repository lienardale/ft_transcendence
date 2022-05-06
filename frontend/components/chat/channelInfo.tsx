import React from 'react';
import Button from '../../styles/components/buttons.module.css';
import classes from '../../styles/pages/Chat.module.css';

function ChannelInfo(props: any) {

    function showChannelInfo(event) {
        event.preventDefault(); 
        props.showChanInfo ? props.onShow(false) : props.onShow(true)
    }

    return (
        <div className={classes.justif}>
          {props.showChanInfo ?
            <button 
              className={Button.big_button}
              onClick={showChannelInfo}
            >
              Hide channel info
            </button>
          :
            <button 
              className={Button.big_button}
              onClick={showChannelInfo}
            >
              Show channel info
            </button>
          }
        </div>
    );
}

export default ChannelInfo;