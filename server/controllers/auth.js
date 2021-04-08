const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const config = require('../utils/config');
const Token = require('../models/token');

const login = async (req, res, next) => {
  try {
    const body = req.body;

    if (!body.username || !body.password) {
      return res.status(400).json({ error: 'Missing Fields' });
    }

    const user = await User.findOne({ username: body.username });

    const password =
      user !== null
        ? await bcrypt.compare(body.password, user.passwordHash)
        : false;

    if (!(user && password)) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    let refreshToken = await user.generateRefreshToken();
    let accessToken = await user.generateAccessToken();

    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 5,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.status(200).send({
      accessToken,
      username: user.username,
      id: user._id,
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const usernameRegex = config.usernameRegex;
    const passwordRegex = config.passwordRegex;
    const emailRegex = config.emailRegex;

    const { username, password, email, bio } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        error: 'Missing fields',
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'invalid email address',
      });
    }

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: 'invalid username format',
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'invalid password format',
      });
    }

    const saltRounds = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username,
      bio,
      email,
      passwordHash,
      created: new Date(),
    });

    const savedUser = await user.save();

    let refreshToken = await user.generateRefreshToken();
    let accessToken = await user.generateAccessToken();

    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 5,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(200).json({
      accessToken,
      username: savedUser.username,
      id: savedUser._id,
    });
  } catch (err) {
    next(err);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(403).json({ error: 'missing token' });
    } else {
      const tokenDB = await Token.findOne({ token: refreshToken });

      if (!tokenDB) {
        res.status(401).json({ error: 'expired token' });
      } else {
        const payload = jwt.verify(tokenDB.token, config.REFRESH_TOKEN_SECRET);
        const newAccessToken = jwt.sign(
          { username: payload.username, id: payload.id },
          config.ACCESS_TOKEN_SECRET,
          { expiresIn: '20m' }
        );
        return res.status(201).json({ accessToken: newAccessToken });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await Token.findOneAndDelete({ token: refreshToken });
    return res.status(200).json({ message: 'user logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  refreshAccessToken,
  logout,
};
