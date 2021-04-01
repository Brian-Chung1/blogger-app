const bcrypt = require('bcrypt');
const User = require('../models/user');
const Notification = require('../models/notification');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', {
      title: 1,
      content: 1,
      likes: 1,
      created: 1,
    });
    res.json(users.map((user) => user.toJSON()));
  } catch (err) {
    next(err);
  }
};

const getIdUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('blogs', {
        title: 1,
        content: 1,
        likes: 1,
        created: 1,
        author: 1,
      })
      .populate('likedBlogs', {
        title: 1,
        content: 1,
        likes: 1,
        created: 1,
        author: 1,
      });

    if (!user) {
      return res
        .status(404)
        .json({ error: 'This User does not exist - invalid id' });
    } else {
      res.json(user.toJSON());
    }
  } catch (err) {
    next(err);
  }
};

const getUsernameUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('blogs', {
        title: 1,
        content: 1,
        likes: 1,
        created: 1,
        author: 1,
      })
      .populate('likedBlogs', {
        title: 1,
        content: 1,
        likes: 1,
        created: 1,
        author: 1,
      });
    if (!user) {
      return res
        .status(404)
        .json({ error: 'This User does not exist - invalid username' });
    } else {
      res.json(user.toJSON());
    }
  } catch (err) {
    next(err);
  }
};

const getUserNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, {
      notifications: 1,
    }).populate('notifications', {
      message: 1,
      read: 1,
      blogId: 1,
      userId: 1,
    });

    if (!user) {
      return res.status(404).json({ error: 'user does not exist' });
    } else {
      res.json(user.toJSON());
    }
  } catch (err) {
    next(err);
  }
};

const deleteUserNotification = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const notificationId = req.params.notificationId;

    const notification = await Notification.findById(notificationId);
    const user = await User.findById(userId);

    if (!user || !notification) {
      return res.status(404).json({ error: 'invalid id' });
    } else {
      user.notifications = user.notifications.filter(
        (u) => u._id.toString() !== notificationId
      );
      await user.save();
      await notification.remove();
    }
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getIdUser,
  getUsernameUser,
  getUserNotifications,
  deleteUserNotification,
};
