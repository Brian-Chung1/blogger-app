const userRouter = require('express').Router();
const users = require('../controllers/users');

userRouter.get('/', users.getUsers);
userRouter.get('/id/:id', users.getIdUser);
userRouter.get('/:username', users.getUsernameUser);
userRouter.get('/id/:id/notification', users.getUserNotifications);
userRouter.delete(
  '/id/:id/notification/:notificationId',
  users.deleteUserNotification
);

module.exports = userRouter;
