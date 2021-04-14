import React, { useState, useContext } from 'react';
import Comments from './Comments';
import Grid from '@material-ui/core/Grid';
import { Divider, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CircularProgress from '@material-ui/core/CircularProgress';
import { UserContext } from '../contexts/UserContext';
import { useHistory } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import Button from '@material-ui/core/Button/Button';
import ShareIcon from '@material-ui/icons/Share';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import BlogEditForm from './BlogEditForm';
import ConfirmationDialog from './ConfirmationDialog';
import { dateFormatter } from '../utils/index';
import CommentForm from './CommentForm';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '20px',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
  },
  content: {
    minHeight: '100px',
  },
  buttons: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  // overflow: {
  //   // overflowWrap: 'break-word',
  //   // wordWrap: 'break-word',
  //   // hyphens: 'auto',
  //   // lineBreak: 'anywhere',
  // },
  headerRight: {
    marginLeft: 'auto',
  },
  likeButton: {
    marginRight: theme.spacing(1),
    '&:hover': {
      color: '#ff3d47',
    },
  },
  commentButton: {
    marginRight: theme.spacing(1),
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      alignItems: 'center',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const BlogView = ({
  blog,
  handleLikes,
  handleComment,
  handleEdit,
  handleDelete,
}) => {
  const classes = useStyles();
  let history = useHistory();
  const { user } = useContext(UserContext);
  const { dispatchNotification } = useNotification();
  const [editBlog, setEdit] = useState(false);
  const [deleteBlog, setDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const open = Boolean(anchorEl);

  if (!blog) {
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const checkBlogAuth = (user, authorId) => {
    if (user) {
      return user.id === authorId ? true : false;
    } else {
      return false;
    }
  };

  const checkUserLiked = (userId, likedUsers) => {
    return likedUsers.includes(userId) ? true : false;
  };

  const closeEditForm = () => {
    setEdit(false);
  };

  const closeDeleteDialog = () => {
    setDelete(false);
  };

  const { title, author, authorId, comments, created, likes, content, id, likedUsers } = blog; //prettier-ignore

  const setNotification = (severity, message) => {
    dispatchNotification({
      type: 'ADD',
      data: {
        severity: severity,
        message: message,
      },
    });
  };

  const emptySubmit = () => {
    setNotification('warning', 'Cannot submit empty comment');
  };

  const comment = async (comment) => {
    try {
      setNotification('success', 'Commented on Post');
      await handleComment(id, comment);
    } catch (err) {
      setNotification('error', 'Failed to Comment on Post');
      console.error(err);
    }
  };

  const share = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setNotification('success', 'Copied link to clipboard!');
  };

  const like = () => {
    handleLikes(id);
    setNotification('success', 'Liked blog post');
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
    }, 1250);
  };

  const unlike = () => {
    handleLikes(id);
    setNotification('info', 'Unliked blog post');
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
    }, 1250);
  };

  const nonUserRedirect = () => {
    setNotification('warning', 'Login Required');
    history.push('/login');
  };

  const menu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="blog-menu"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={
          !user
            ? nonUserRedirect
            : checkUserLiked(user.id, likedUsers)
            ? unlike
            : like
        }
      >
        <IconButton>
          <FavoriteIcon />
        </IconButton>
        <p>{user && checkUserLiked(user.id, likedUsers) ? 'Unlike' : 'Like'}</p>
      </MenuItem>

      <MenuItem onClick={share}>
        <IconButton>
          <ShareIcon />
        </IconButton>
        <p>Share</p>
      </MenuItem>

      {checkBlogAuth(user, authorId) && (
        <MenuItem onClick={() => setEdit(true)}>
          <IconButton>
            <EditIcon />
          </IconButton>
          <p>Edit Post</p>
        </MenuItem>
      )}
      {checkBlogAuth(user, authorId) && (
        <MenuItem onClick={() => setDelete(true)}>
          <IconButton>
            <DeleteForeverIcon />
          </IconButton>
          <p>Delete Post</p>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <>
      <Paper elevation={3} variant="outlined" className={classes.paper}>
        <Grid container spacing={2} direction="column" className={classes.root}>
          <Grid item className={classes.header}>
            <div>
              <Typography className={classes.overflow} variant="h2">
                {title}
              </Typography>
              <Typography variant="h6">{`${dateFormatter(
                created
              )} by ${author}`}</Typography>
            </div>

            <Typography variant="h3" className={classes.headerRight}>
              {likes}
              <FavoriteIcon
                fontSize="large"
                color="secondary"
                className={classes.buttons}
              />
            </Typography>
          </Grid>

          <Divider />
          <Grid item className={classes.content}>
            {editBlog ? (
              <BlogEditForm
                currentContent={content}
                closeEditForm={closeEditForm}
                handleEdit={handleEdit}
                id={id}
              />
            ) : (
              <Typography>{content}</Typography>
            )}
          </Grid>
          <Grid item container direction="row">
            <div className={classes.sectionDesktop}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FavoriteIcon />}
                className={classes.likeButton}
                disabled={disabled}
                onClick={
                  !user
                    ? nonUserRedirect
                    : checkUserLiked(user.id, likedUsers)
                    ? unlike
                    : like
                }
              >
                {user && checkUserLiked(user.id, likedUsers)
                  ? 'Unlike'
                  : 'Like'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShareIcon />}
                className={classes.buttons}
                onClick={share}
              >
                Share
              </Button>

              {checkBlogAuth(user, authorId) && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    className={classes.buttons}
                    onClick={() => setEdit(true)}
                  >
                    Edit Post
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DeleteForeverIcon />}
                    className={classes.buttons}
                    onClick={() => setDelete(true)}
                  >
                    Delete Post
                  </Button>
                </>
              )}

              <ConfirmationDialog
                open={deleteBlog}
                handleClose={closeDeleteDialog}
                handleDelete={handleDelete}
                id={id}
              />
            </div>
            <div className={classes.sectionMobile}>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreHorizIcon />
              </IconButton>
            </div>
          </Grid>

          <Grid item>
            <CommentForm
              label={user ? `Comment as ${user.username}` : 'Login to comment'}
              user={user ? true : false}
              comment={comment}
              nonUserRedirect={nonUserRedirect}
              emptySubmit={emptySubmit}
            />
          </Grid>
          <Typography variant="h5">Comments</Typography>
          <Grid item>
            {comments.map((comment) => (
              <div key={comment._id}>
                <Divider />
                <Comments commentObj={comment} />
                <Divider />
              </div>
            ))}
          </Grid>
        </Grid>
        {menu}
      </Paper>
    </>
  );
};

export default BlogView;
