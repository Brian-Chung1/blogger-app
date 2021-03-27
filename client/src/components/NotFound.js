import React from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
}));

export const NotFound = () => {
  let history = useHistory();
  const classes = useStyles();

  return (
    <Container component="main" className={classes.main} maxWidth="md">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="h2">404 Page Not Found</Typography>
      <Typography variant="h5">
        - If you are unable to load any pages, check your data or Wi-Fi
        Connection
      </Typography>
      <Button
        color="primary"
        variant="contained"
        size="large"
        onClick={() => history.push('/')}
      >
        Go Home
      </Button>
    </Container>
  );
};

export default NotFound;
