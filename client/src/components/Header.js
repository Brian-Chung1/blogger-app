import React, { useContext, useState } from 'react';
import {
  makeStyles,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import { UserContext } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import PostAddIcon from '@material-ui/icons/PostAdd';
import IconButton from '@material-ui/core/IconButton';
import { usernameColor } from '../utils/index';
import GestureIcon from '@material-ui/icons/Gesture';
import NotificationsNoneOutlinedIcon from '@material-ui/icons/NotificationsNoneOutlined';
import Badge from '@material-ui/core/Badge';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CloseIcon from '@material-ui/icons/Close';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import authService from '../services/auth';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const useStyles = makeStyles((theme) => ({
  typographyStyles: {
    flexGrow: 1,
    color: 'white',
  },
  nav: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  headerSpacing: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  logo: {
    marginRight: 'auto',
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
  smallAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
}));

const Header = ({ notifications, handleNotificationRemoval }) => {
  let history = useHistory();
  const classes = useStyles();
  const { user, setUser } = useContext(UserContext);
  const { dispatchNotification } = useNotification();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const mobileOpen = Boolean(mobileAnchorEl);

  const id = open ? 'alerts' : undefined;

  const handleClick = (event) => {
    if (notifications.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.localStorage.removeItem('blogAppUser');
    setUser(null);
    dispatchNotification({
      type: 'ADD',
      data: {
        open: true,
        severity: 'info',
        message: `${user.username} logged out`,
      },
    });
  };

  const handleGuestLogin = async () => {
    const user = await authService.guestLogin();
    window.localStorage.setItem('blogAppUser', JSON.stringify(user));
    setUser(user);
    history.push('/');
    dispatchNotification({
      type: 'ADD',
      data: {
        open: true,
        severity: 'success',
        message: 'Successfully logged in as a guest',
      },
    });
  };

  if (user) {
    return (
      <>
        <AppBar position="static" className={classes.nav}>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.logo}
              onClick={() => history.push('/')}
            >
              <Typography variant="h4" className={classes.typographyStyles}>
                Blogger
              </Typography>
              <GestureIcon style={{ fontSize: 40 }} color="secondary" />
            </IconButton>

            <div className={classes.sectionDesktop}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<PostAddIcon />}
                className={classes.headerSpacing}
                onClick={() => history.push('/submit')}
              >
                Create Post
              </Button>

              <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={notifications.length} color="secondary">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List>
                  {notifications.map((n) => {
                    return (
                      <ListItem divider key={n.id}>
                        <ListItem
                          button
                          component="a"
                          href={`/blogs/${n.blogId}`}
                        >
                          <ListItemText primary={n.message} />
                        </ListItem>
                        <IconButton
                          onClick={() =>
                            handleNotificationRemoval(user.id, n.id)
                          }
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Popover>

              <IconButton
                onClick={() => history.push(`/user/${user.username}`)}
              >
                <Avatar
                  style={{
                    backgroundColor: usernameColor(user.username, 30, 80),
                  }}
                >
                  {user.username.charAt(0)}
                </Avatar>
              </IconButton>
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<ExitToAppIcon />}
                className={classes.headerSpacing}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton onClick={handleMobileMenuOpen} color="inherit">
                <MenuIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileAnchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          id="mobile-menu"
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={mobileOpen}
          onClose={handleMobileMenuClose}
        >
          <MenuItem onClick={() => history.push('/submit')}>
            <IconButton color="inherit">
              <PostAddIcon />
            </IconButton>
            <p>Create Post</p>
          </MenuItem>

          <MenuItem onClick={handleClick}>
            <IconButton>
              <Badge badgeContent={notifications.length} color="secondary">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
            <p>Notifications</p>
          </MenuItem>

          <MenuItem onClick={() => history.push(`/user/${user.username}`)}>
            <IconButton>
              <Avatar
                className={classes.smallAvatar}
                style={{
                  backgroundColor: usernameColor(user.username, 30, 80),
                }}
              >
                {user.username.charAt(0)}
              </Avatar>
            </IconButton>
            <p>Profile</p>
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <IconButton>
              <ExitToAppIcon />
            </IconButton>
            <p>Logout</p>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      <AppBar position="static" className={classes.nav}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.logo}
            onClick={() => history.push('/')}
          >
            <Typography variant="h4" className={classes.typographyStyles}>
              Blogger
            </Typography>
            <GestureIcon style={{ fontSize: 40 }} color="secondary" />
          </IconButton>

          <div className={classes.sectionDesktop}>
            <Button
              color="inherit"
              variant="outlined"
              onClick={handleGuestLogin}
            >
              Guest Sign In
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              className={classes.headerSpacing}
              onClick={() => history.push('/login')}
            >
              Login
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => history.push('/register')}
            >
              Sign Up
            </Button>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton onClick={handleMobileMenuOpen} color="inherit">
              <MenuIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={mobileAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id="mobile-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={mobileOpen}
        onClose={handleMobileMenuClose}
      >
        <MenuItem onClick={handleGuestLogin}>
          <p>Guest Sign In</p>
        </MenuItem>
        <MenuItem onClick={() => history.push('/login')}>
          <p>Login</p>
        </MenuItem>

        <MenuItem onClick={() => history.push('/register')}>
          <p>Sign Up</p>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
