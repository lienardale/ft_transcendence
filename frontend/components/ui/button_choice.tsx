import React from 'react';
import Button from '../../styles/components/buttons.module.css';

function ButtonChoice(props: any) {

    function handleClick() {
        props.onClick();
    }

    return (
        <div>
            {props.choice === 'button_simple' ?
            <button 
                    className={Button.button_simple}
                    onClick={(e) => {
                        e.preventDefault();
                        handleClick();
                    }}
                >
                    {props.label}
            </button>
            :
            <button 
                    className={Button.big_button}
                    onClick={(e) => {
                        e.preventDefault();
                        handleClick();
                    }}
                >
                    {props.label}
            </button>
            }
        </div>
    );
}

export default ButtonChoice;