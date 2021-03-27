import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { dateFormatter } from '../utils/index';
import { makeStyles } from '@material-ui/core/styles';

const Comments = ({ commentObj }) => {
  const { comment, timestamp, username } = commentObj;

  return (
    <Card>
      <CardHeader
        avatar={<Avatar aria-label="avatar">{username.charAt(0)}</Avatar>}
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
