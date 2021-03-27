import React, { useState, useEffect, useMemo } from 'react';
import { CssBaseline, makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Header from './components/Header';
import Footer from './components/Footer';
import Content from './components/Content';
import blogService from './services/blogs';
import userService from './services/user';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import BlogView from './components/BlogView';
import Login from './components/Login';
import Registration from './components/Registration';
import { UserContext } from './contexts/UserContext';
import Profile from './components/Profile';
import BlogForm from './components/BlogForm';
import NotFound from './components/NotFound';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
  },
}));

const App = () => {
  const classes = useStyles();
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const userProvider = useMemo(() => ({ user, setUser }), [user, setUser]);

  useEffect(() => {
    const loggedInUser = window.localStorage.getItem('blogAppUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUser(user);
    }
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAllBlogs();
        setBlogs(blogs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (user == null) return;
    const fetchNotifications = async () => {
      try {
        const notifications = await userService.getUserNotification(user.id);
        setNotifications(notifications);
      } catch (err) {
        console.log(err);
      }
    };
    fetchNotifications();
  }, [user]);

  const match = useRouteMatch('/blogs/:id');
  const blog = match ? blogs.find((blog) => blog.id === match.params.id) : null;

  const handleLikes = async (id) => {
    try {
      const likedBlog = await blogService.likeBlog(id);
      setBlogs(blogs.map((blog) => (blog.id !== id ? blog : likedBlog)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (id, comment) => {
    const commentedBlog = await blogService.commentBlog(id, comment);
    setBlogs(blogs.map((blog) => (blog.id !== id ? blog : commentedBlog)));
  };

  const handleBlogSubmission = async (blog) => {
    const newBlog = await blogService.postBlog(blog);
    setBlogs(blogs.concat(newBlog));
    return newBlog;
  };

  const handleEdit = async (id, content) => {
    const edittedBlog = await blogService.editBlog(id, { content });
    setBlogs(blogs.map((blog) => (blog.id !== id ? blog : edittedBlog)));
  };

  const handleDelete = async (id) => {
    await blogService.deleteBlog(id);
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  const handleNotificationRemoval = async (userId, notificationId) => {
    await userService.deleteUserNotification(userId, notificationId);
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  return (
    <>
      <UserContext.Provider value={userProvider}>
        <Grid container direction="column" className={classes.wrapper}>
          <Grid item>
            <Header
              notifications={notifications}
              handleNotificationRemoval={handleNotificationRemoval}
            />
          </Grid>
          <Grid item container className={classes.main}>
            <Grid item xs={false} sm={2} />
            <Grid item xs={12} sm={8}>
              <Switch>
                <Route path="/" exact>
                  <Content
                    blogs={blogs}
                    handleLikes={handleLikes}
                    user={user}
                  />
                </Route>
                <Route path="/blogs/:id">
                  <BlogView
                    blog={blog}
                    handleLikes={handleLikes}
                    handleComment={handleComment}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                  />
                </Route>
                <Route path="/submit">
                  {window.localStorage.getItem('blogAppUser') ? (
                    <BlogForm handleBlogSubmission={handleBlogSubmission} />
                  ) : (
                    <Redirect to="/login" />
                  )}
                </Route>
                <Route path={'/user/:username'}>
                  <Profile handleLikes={handleLikes} />
                </Route>
                <Route path="/login">
                  <Login />
                </Route>
                <Route path="/register">
                  <Registration />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </Grid>
            <Grid item xs={false} sm={2} />
          </Grid>
          <Grid item>
            <Footer className={classes.footer} />
          </Grid>
        </Grid>
      </UserContext.Provider>
    </>
  );
};

export default App;
