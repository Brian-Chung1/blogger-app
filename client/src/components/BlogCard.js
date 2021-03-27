import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import ShareIcon from '@material-ui/icons/Share';
import IconButton from '@material-ui/core/IconButton';
import CardActionArea from '@material-ui/core/CardActionArea';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import { useHistory } from 'react-router-dom';
import { dateFormatter, usernameColor } from '../utils/index';
import { useNotification } from '../contexts/NotificationContext';
import { UserContext } from '../contexts/UserContext';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 255,
  },
  iconSpacing: {
    marginRight: theme.spacing(1),
  },
  onCardHover: {
    '&:hover $focusHighlight': {
      opacity: 0,
    },
  },
  title: {
    fontSize: 32,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  focusHighlight: {},
  onUserHover: {
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
    cursor: 'pointer',
    margin: 0,
  },
  content: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    height: 35,
  },
  padding: {
    paddingBottom: 0,
  },
  likeButton: {
    '&:hover': {
      color: '#ff3d47',
    },
  },
  avatar: {
    cursor: 'pointer',
  },
}));

export const BlogCard = ({ blog, handleLikes, checkUserLiked }) => {
  let history = useHistory();
  const classes = useStyles();
  const { dispatchNotification } = useNotification();
  const { user } = useContext(UserContext);

  const {
    title,
    content,
    likes,
    author,
    created,
    comments,
    id,
    likedUsers,
  } = blog;

  const setNotification = (severity, message) => {
    dispatchNotification({
      type: 'ADD',
      data: {
        severity: severity,
        message: message,
      },
    });
  };

  const viewBlog = (e) => {
    history.push(`/blogs/${id}`);
  };

  const viewUser = (e) => {
    e.stopPropagation();
    e.preventDefault();
    history.push(`/user/${author}`);
  };

  const share = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const link = window.location.href;
    navigator.clipboard.writeText(`${link}blogs/${id}`);
    setNotification('success', 'Copied link to clipboard!');
  };

  const like = () => {
    handleLikes(id);
    setNotification('success', 'Liked blog post');
  };

  const unlike = () => {
    handleLikes(id);
    setNotification('info', 'Unliked blog post');
  };

  const nonUserRedirect = () => {
    setNotification('warning', 'Login Required');
    history.push('/login');
  };

  return (
    <Card className={classes.root} variant="outlined">
      <CardHeader
        avatar={
          <Avatar
            aria-label="user-avatar"
            style={{ backgroundColor: usernameColor(author, 30, 80) }}
            className={classes.avatar}
            onClick={viewUser}
          >
            {author.charAt(0)}
          </Avatar>
        }
        action={
          <IconButton aria-label="share" onClick={share}>
            <ShareIcon />
          </IconButton>
        }
        title={
          <Typography className={classes.onUserHover} onClick={viewUser}>
            {author}
          </Typography>
        }
        subheader={dateFormatter(created)}
        className={classes.padding}
      />
      <CardActionArea
        classes={{
          root: classes.onCardHover,
          focusHighlight: classes.focusHighlight,
        }}
        onClick={viewBlog}
      >
        <CardContent className={classes.padding}>
          <Typography className={classes.title} variant="h4" component="h2">
            {title}
          </Typography>
          <Typography className={classes.content} variant="h6" component="p">
            {content}
          </Typography>
          <Typography variant="subtitle1" color="primary">
            Continue reading...
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions>
        <Button size="small" onClick={viewBlog}>
          <CommentOutlinedIcon className={classes.iconSpacing} />
          <Typography variant="subtitle2">
            {' '}
            {`${comments ? comments.length : 0} Comments`}
          </Typography>
        </Button>
        <Button
          color={checkUserLiked ? 'secondary' : 'default'}
          size="large"
          className={classes.likeButton}
          startIcon={<FavoriteBorderIcon />}
          onClick={!user ? nonUserRedirect : checkUserLiked ? unlike : like}
        >
          {likes}
        </Button>
      </CardActions>
    </Card>
  );
};

export default BlogCard;
