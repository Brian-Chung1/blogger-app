import React, { useContext } from 'react';
import { Formik, Form } from 'formik';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import authService from '../services/auth';
import * as yup from 'yup';
import { MyTextField, MyCheckBox } from './CustomFields';
import { useNotification } from '../contexts/NotificationContext';

//TODO ------------------------------------------------
//tie in remember me function
//-----------------------------------------------------

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1.5, 0, 2),
  },
}));

const validationSchema = yup.object({
  username: yup.string().required('Username Required'),
  password: yup.string().required('Password Required'),
});

const Login = () => {
  const classes = useStyles();
  let history = useHistory();
  const { dispatchNotification } = useNotification();
  const { setUser } = useContext(UserContext);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <Formik
          initialValues={{ username: '', password: '', remember: false }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              const user = await authService.login({
                username: values.username,
                password: values.password,
              });
              window.localStorage.setItem('blogAppUser', JSON.stringify(user));
              setUser(user);
              history.push('/');
              dispatchNotification({
                type: 'ADD',
                data: {
                  open: true,
                  severity: 'success',
                  message: `Successfully logged in as ${user.username}`,
                },
              });
            } catch (err) {
              dispatchNotification({
                type: 'ADD',
                data: {
                  open: true,
                  severity: 'error',
                  message: err.response.data.error,
                },
              });
            }
          }}
        >
          {({ values, errors, isSubmitting }) => (
            <Form className={classes.form}>
              <MyTextField name="username" label="Username" type="input" />
              <MyTextField name="password" label="Password" type="password" />

              {/* <pre>{JSON.stringify(values, null, 2)}</pre>
              <pre>{JSON.stringify(errors, null, 2)}</pre> */}
              <MyCheckBox name="remember" type="checkbox" label="Remember me" />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={isSubmitting}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    onClick={() => history.push('/register')}
                    variant="body2"
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};

export default Login;
