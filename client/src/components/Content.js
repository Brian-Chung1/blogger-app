import React from 'react';
import BlogCard from './BlogCard';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
}));

const Content = ({ blogs, handleLikes, inProfile }) => {
  const classes = useStyles();

  return (
    <Grid className={classes.root} container spacing={3}>
      {blogs.map((blog) => {
        return (
          <Grid key={blog.id} item xs={12} sm={12} md={6}>
            <BlogCard
              blog={blog}
              handleLikes={handleLikes}
              inProfile={inProfile}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Content;
