import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import userService from '../services/user';
import { useNotification } from '../contexts/NotificationContext';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useRouteMatch } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import { Typography } from '@material-ui/core';
import { dateFormatter, usernameColor } from '../utils/index';
import Content from './Content';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
  },
  testing: {
    border: '1px solid red',
  },
  filter: {
    width: theme.spacing(20),
  },
}));

const Profile = ({ handleLikes }) => {
  const classes = useStyles();
  const [user, setUser] = useState(null);
  const [exist, setExist] = useState(true);
  const { dispatchNotification } = useNotification();
  const [filter, setFilter] = useState('Posts');
  const match = useRouteMatch('/user/:username');
  console.log(user);
  useEffect(() => {
    getUser();
  }, [match.params.username]);

  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  const getUser = async () => {
    try {
      const user = await userService.getUsernameUser(match.params.username);
      setUser(user);
    } catch (error) {
      setExist(false);
      console.error(error);
      dispatchNotification({
        type: 'ADD',
        data: {
          severity: 'error',
          message: 'Failed to retrieve profile',
        },
      });
    }
  };

  if (!user) {
    if (!exist) {
      return <Typography variant="h2">User does not exist</Typography>;
    }
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  const { blogs, created, username, likedBlogs } = user;

  return (
    <Grid container>
      <Grid item xs={false} sm={2} />

      <Grid item xs={12} sm={8}>
        <Paper className={classes.main}>
          <Avatar
            className={classes.avatar}
            style={{ backgroundColor: usernameColor(username, 30, 80) }}
          >
            {username.charAt(0)}
          </Avatar>
          <Typography variant="h2" component="h1">
            {username}
          </Typography>
          <div>
            <Typography variant="h6">{`User since ${dateFormatter(
              created
            )}`}</Typography>
            <Typography variant="h6">{`Total Posts: ${blogs.length}`}</Typography>
          </div>
        </Paper>
        <FormControl className={classes.filter}>
          <InputLabel id="filter-label">Filter</InputLabel>
          <Select
            labelId="select-filter"
            id="select"
            value={filter}
            onChange={handleChange}
          >
            <MenuItem value={'Posts'}>Posts</MenuItem>
            <MenuItem value={'Liked'}>Liked Posts</MenuItem>
          </Select>
        </FormControl>
        {filter === 'Posts' ? (
          <Content blogs={blogs} handleLikes={handleLikes} inProfile={true} />
        ) : (
          <Content
            blogs={likedBlogs}
            handleLikes={handleLikes}
            inProfile={true}
          />
        )}
      </Grid>

      <Grid item xs={false} sm={2} />
    </Grid>
  );
};

export default Profile;
