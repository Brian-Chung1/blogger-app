const express = require('express');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const blogsRouter = require('./routes/blog.routes');
const userRouter = require('./routes/user.routes');
const authRouter = require('./routes/auth.routes');
const middleware = require('./utils/middleware');
const path = require('path');
const cookieParser = require('cookie-parser');

// app.use(
//   cors({
//     origin: 'http://localhost:3001',
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: 'http://blogger.us-west-1.elasticbeanstalk.com/',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.json());

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
