import React from 'react';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import { MyCommentArea } from './CustomFields';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

const commentSchema = yup.object({
  comment: yup
    .string()
    .max(200, 'Comment must be less than 200 characters')
    .notRequired(),
});

const useStyles = makeStyles((theme) => ({
  commentButton: {
    marginRight: theme.spacing(1),
  },
}));

export const CommentForm = ({
  label,
  user,
  comment,
  nonUserRedirect,
  emptySubmit,
}) => {
  const classes = useStyles();

  return (
    <Formik
      initialValues={{ comment: '' }}
      validationSchema={commentSchema}
      onSubmit={async (values, { resetForm }) => {
        if (!user) {
          nonUserRedirect();
          return;
        }

        if (values.comment.trim === '' || !values.comment) {
          emptySubmit();
          return;
        } else {
          await comment(values);
          resetForm({});
        }
      }}
    >
      {({ values, errors, isSubmitting }) => (
        <Form>
          {/* <pre>{JSON.stringify(values, null, 2)}</pre>
          <pre>{JSON.stringify(errors, null, 2)}</pre> */}
          <MyCommentArea name="comment" type="text" rows={4} label={label} />
          <Fab
            color="primary"
            variant="extended"
            aria-label="comment"
            type="submit"
            disabled={isSubmitting}
          >
            <ChatBubbleIcon className={classes.commentButton} />
            Comment
          </Fab>
        </Form>
      )}
    </Formik>
  );
};

export default CommentForm;
