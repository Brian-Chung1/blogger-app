const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const Notification = require('../models/notification');
const config = require('../utils/config');

const getAll = async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
    res.status(200).json(blogs);
  } catch (err) {
    next(err);
  }
};

const getIdBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ error: 'invalid id - blog does not exist' });
    } else {
      res.status(200).json(blog.toJSON());
    }
  } catch (err) {
    next(err);
  }
};

const postBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing Fields' });
    }

    const decodedToken = jwt.verify(req.token, config.ACCESS_TOKEN_SECRET);

    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decodedToken.id);
    const { username, id } = user;

    const blog = new Blog({
      title: title,
      content: content,
      likes: 0,
      author: username,
      authorId: id,
      created: new Date(),
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);

    await user.save();
    res.status(201).json(savedBlog.toJSON());
  } catch (err) {
    next(err);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, config.ACCESS_TOKEN_SECRET);

    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: 'invalid token' });
    }

    const user = await User.findById(decodedToken.id);
    const blog = await Blog.findById(req.params.id);

    if (blog.authorId.toString() === user._id.toString()) {
      await blog.remove();
      res.status(204).end();
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    next(err);
  }
};

const likeBlog = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, config.ACCESS_TOKEN_SECRET);

    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decodedToken.id);
    const blog = await Blog.findById(req.params.id);
    const currentLikes = blog.likes;

    if (user.likedBlogs.includes(blog.id)) {
      const updatedLikedUsers = blog.likedUsers.filter(
        (u) => u._id.toString() !== user._id.toString()
      );

      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { likes: currentLikes - 1, likedUsers: updatedLikedUsers },
        {
          new: true,
        }
      );

      user.likedBlogs = user.likedBlogs.filter(
        (blog) => blog._id.toString() !== updatedBlog._id.toString()
      );

      await user.save();
      res.status(200).json(updatedBlog.toJSON());
    } else {
      const updatedLikedUsers = blog.likedUsers.concat(user._id);

      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { likes: currentLikes + 1, likedUsers: updatedLikedUsers },
        {
          new: true,
        }
      );

      user.likedBlogs = user.likedBlogs.concat(updatedBlog._id);

      await user.save();

      const author = await User.findOne({ username: blog.author });

      const notification = new Notification({
        message: `${user.username} has liked your post!`,
        read: false,
        blogId: blog._id,
        userId: user._id,
      });

      const savedNotification = await notification.save();
      author.notifications = author.notifications.concat(savedNotification._id);

      await author.save();
      res.json(updatedBlog.toJSON());
    }
  } catch (err) {
    next(err);
  }
};

const commentBlog = async (req, res, next) => {
  try {
    const { comment } = req.body;

    const decodedToken = jwt.verify(req.token, config.ACCESS_TOKEN_SECRET);

    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decodedToken.id);
    const blog = await Blog.findById(req.params.id);

    const newComment = {
      comment: comment,
      timestamp: new Date(),
      username: user.username,
    };

    blog.comments = blog.comments.concat(newComment);
    const updatedBlog = await blog.save();

    const author = await User.findOne({ username: blog.author });

    const notification = new Notification({
      message: `${user.username} has commented on your post!`,
      read: false,
      blogId: blog._id,
      userId: user._id,
    });

    const savedNotification = await notification.save();
    author.notifications = author.notifications.concat(savedNotification._id);

    await author.save();
    res.status(201).json(updatedBlog.toJSON());
  } catch (err) {
    next(err);
  }
};

const editBlog = async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET);

  if (!req.token || !decodedToken.id) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await User.findById(decodedToken.id);
  const blog = await Blog.findById(req.params.id);

  if (blog.authorId.toString() === user._id.toString()) {
    const content = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, content, {
      new: true,
    });
    res.json(updatedBlog.toJSON());
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  getAll,
  getIdBlog,
  postBlog,
  deleteBlog,
  likeBlog,
  commentBlog,
  editBlog,
};
