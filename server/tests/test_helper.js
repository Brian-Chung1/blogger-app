const Blog = require('../models/blog');
const User = require('../models/user');
const Notification = require('../models/notification');

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const notificationsInDb = async () => {
  const notifications = await Notification.find({});
  return notifications.map((notification) => notification.toJSON());
};

module.exports = {
  blogsInDb,
  usersInDb,
  notificationsInDb,
};
