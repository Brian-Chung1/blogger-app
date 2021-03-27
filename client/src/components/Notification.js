import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  close: {
    padding: theme.spacing(0.5),
  },
}));

export const Notification = ({ notification }) => {
  //testing this below
  // if(notification.message === '') {
  //   return null;
  // }

  const classes = useStyles();
  const [open, setOpen] = useState();
  const { id, message, severity, timer } = notification;

  useEffect(() => {
    setOpen(notification.open);
  }, [notification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Snackbar
        key={id}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={timer}
        onClose={handleClose}
        action={
          <React.Fragment>
            <IconButton
              aria-label="close"
              color="inherit"
              className={classes.close}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      >
        <Alert severity={severity}>{message}</Alert>
      </Snackbar>
    </>
  );
};

export default Notification;
