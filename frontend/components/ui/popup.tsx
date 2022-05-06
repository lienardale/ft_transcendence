import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import classes from '../../styles/components/popup.module.css';

function PopUp(props: any) {
  
    const handleClose = () => {
        props.onClose();
    };
    
    const handleSubmit = () => {
        props.onSubmit();
    };

    const handleOther = () => {
        props.onOther();
    }

    return (
        <div>
            <Dialog open={props.open} onClose={handleClose}>
                <div className={classes.popup}>
                <DialogTitle>
                    {props.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {props.context}
                    </DialogContentText>
                {props.children}
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {props.other ?
                <Button onClick={handleOther}>{props.other}</Button>
                : <p></p>}
                <Button onClick={handleSubmit}>{props.submit}</Button>
                </DialogActions>
                </div>
            </Dialog>
        </div>
    );
}

export default PopUp;