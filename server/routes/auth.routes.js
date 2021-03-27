const authRouter = require('express').Router();
const auth = require('../controllers/auth');

authRouter.post('/login', auth.login);
authRouter.post('/register', auth.register);
authRouter.post('/refresh', auth.refreshAccessToken);
authRouter.post('/logout', auth.logout);

module.exports = authRouter;
