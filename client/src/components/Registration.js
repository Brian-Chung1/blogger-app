import React, { useContext } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import authService from '../services/auth';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { MyTextField } from './CustomFields';
import { useNotification } from '../contexts/NotificationContext';

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
    margin: theme.spacing(3, 0, 2),
  },
}));

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email Address Required'),
  username: yup
    .string()
    .required('Username Required')
    .min(4, 'Must be greater than 4 characters')
    .max(20, 'Must be less than 20 characters')
    .matches('^([A-Za-z0-9]){4,20}$', {
      message: 'Username must be letters and numbers only',
      excludeEmptyString: false,
    }),
  password: yup
    .string()
    .required('Password Required')
    .min(8, 'Must be at least 8 characters long')
    .matches('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$', {
      message: 'Must contain at least 1 uppercase, 1 lowercase, and 1 number',
      excludeEmptyString: false,
    }),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Password do not match')
    .required('Password Confirmation Required'),
});

const Registration = () => {
  const classes = useStyles();
  let history = useHistory();
  const { setUser } = useContext(UserContext);
  const { dispatchNotification } = useNotification();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Formik
          initialValues={{
            email: '',
            username: '',
            password: '',
            passwordConfirm: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              const registeredUser = await authService.register({
                email: values.email,
                username: values.username,
                password: values.password,
              });

              window.localStorage.setItem(
                'blogAppUser',
                JSON.stringify(registeredUser)
              );
              setUser(registeredUser);
              history.push('/');
              dispatchNotification({
                type: 'ADD',
                data: {
                  severity: 'success',
                  message: `Account successfully created!`,
                },
              });
            } catch (err) {
              dispatchNotification({
                type: 'ADD',
                data: {
                  severity: 'error',
                  message: err.response.data.error,
                  timer: 5000,
                },
              });
            }
          }}
        >
          {({ values, errors, isSubmitting }) => (
            <Form className={classes.form}>
              <MyTextField name="email" type="input" label="Email" />
              <MyTextField name="username" type="input" label="Username" />
              <MyTextField name="password" type="password" label="Password" />
              <MyTextField
                name="passwordConfirm"
                type="password"
                label="Confirm Password"
              />
              {/* <pre>{JSON.stringify(values, null, 2)}</pre>
              <pre>{JSON.stringify(errors, null, 2)}</pre> */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={isSubmitting}
              >
                Sign Up
              </Button>
              <Grid container justify="flex-end">
                <Grid item>
                  <Link onClick={() => history.push('/login')} variant="body2">
                    Already have an account? Sign in
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

export default Registration;
