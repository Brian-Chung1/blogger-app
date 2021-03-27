import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useNotification } from '../contexts/NotificationContext';

const useStyles = makeStyles((theme) => ({
  buttonSpacing: {
    marginLeft: theme.spacing(2),
  },
}));

export const BlogEditForm = ({
  currentContent,
  closeEditForm,
  handleEdit,
  id,
}) => {
  const classes = useStyles();
  const [editField, setEditField] = useState(currentContent);
  const { dispatchNotification } = useNotification();

  const edit = async (e) => {
    e.preventDefault();
    if (currentContent === editField) return;
    try {
      await handleEdit(id, editField);
      dispatchNotification({
        type: 'ADD',
        data: {
          severity: 'success',
          message: 'Blog Successfully Editted',
        },
      });
      closeEditForm();
    } catch (error) {
      dispatchNotification({
        type: 'ADD',
        data: {
          severity: 'error',
          message: 'Failed to edit Blog',
        },
      });
    }
  };

  return (
    <div>
      <TextField
        variant="outlined"
        multiline
        rows={6}
        value={editField}
        fullWidth
        onChange={({ target }) => setEditField(target.value)}
      />
      <Button
        disabled={currentContent === editField}
        variant="contained"
        color="primary"
        onClick={edit}
      >
        Save Changes
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={closeEditForm}
        className={classes.buttonSpacing}
      >
        Cancel
      </Button>
    </div>
  );
};

export default BlogEditForm;
