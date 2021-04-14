import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { dateFormatter } from '../utils/index';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatarHover: {
    cursor: 'pointer',
  },
}));

const Comments = ({ commentObj }) => {
  let history = useHistory();
  const classes = useStyles();
  const { comment, timestamp, username } = commentObj;

  const viewUser = (e) => {
    e.stopPropagation();
    e.preventDefault();
    history.push(`/user/${username}`);
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar
            onClick={viewUser}
            aria-label="avatar"
            className={classes.avatarHover}
          >
            {username.charAt(0)}
          </Avatar>
        }
        title={username}
        subheader={dateFormatter(timestamp)}
      />
      <CardContent>
        <Typography variant="body2" component="p">
          {comment}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Comments;
