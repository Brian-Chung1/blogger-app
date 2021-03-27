import React from 'react';
import Typography from '@material-ui/core/Typography';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { MyTextField, MyTextArea } from './CustomFields';
import { useHistory } from 'react-router-dom';
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
    backgroundColor: '#2a9d8f',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const blogSubmissionSchema = yup.object({
  title: yup
    .string()
    .required('Blog Title Required')
    .max(100, 'Title must be less than 100 characters'),
  content: yup.string().optional(),
});

const BlogForm = ({ handleBlogSubmission }) => {
  const classes = useStyles();
  let history = useHistory();
  const { dispatchNotification } = useNotification();

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <BorderColorIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Write a post
        </Typography>
        <Formik
          initialValues={{ title: '', content: '' }}
          validationSchema={blogSubmissionSchema}
          onSubmit={async (values) => {
            try {
              const newBlog = await handleBlogSubmission(values);
              history.push(`/blogs/${newBlog.id}`);
              dispatchNotification({
                type: 'ADD',
                data: {
                  open: true,
                  message: 'Blog Created',
                  severity: 'success',
                },
              });
            } catch (error) {
              dispatchNotification({
                type: 'ADD',
                data: {
                  open: true,
                  message: 'Blog Creation Failed',
                  severity: 'error',
                },
              });
              console.error(error);
            }
          }}
        >
          {({ values, errors, isSubmitting }) => (
            <Form className={classes.form}>
              <MyTextField name="title" label="Title" type="input" />

              <MyTextArea
                name="content"
                label="Content (Optional)"
                type="input"
                rows={10}
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
                Post
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};

export default BlogForm;
