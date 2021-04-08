const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const api = supertest(app);
const Token = require('../models/token');
const Notification = require('../models/notification');
require('dotenv').config();

let user;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    await Blog.deleteMany({});
    await User.deleteMany({});
    await Token.deleteMany({});
    await Notification.deleteMany({});

    const newUser = {
      username: 'test',
      password: 'Password1',
      email: 'test@gmail.com',
    };

    const response = await api.post('/auth/register').send(newUser);
    user = response.body;
  } catch (err) {
    console.log('error: connecting to MongoDB: ', err.message);
  }
});

describe('get: getting users', () => {
  test('getting all users', async () => {
    const response = await api
      .get('/api/user')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const users = response.body;
    const { blogs, likedBlogs, notifications, username, email } = users[0];

    expect(blogs).toHaveLength(0);
    expect(likedBlogs).toHaveLength(0);
    expect(notifications).toHaveLength(0);
    expect(username).toBe('test');
    expect(email).toBe('test@gmail.com');
  });

  test('getting id user', async () => {
    const response = await api
      .get(`/api/user/id/${user.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const returnedUser = response.body;

    expect(returnedUser.username).toBe('test');
  });

  test('getting named user', async () => {
    const response = await api
      .get(`/api/user/test`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const user = response.body;

    expect(user.username).toBe('test');
  });

  test('getting invalid id user', async () => {
    const invalidId = '1234asdf2343';
    const response = await api
      .get(`/api/user/id/${invalidId}`)
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toContain(
      'This User does not exist - invalid id'
    );
  });

  test('getting invalid named user', async () => {
    const invalidUsername = 'blahblah';
    const response = await api
      .get(`/api/user/${invalidUsername}`)
      .expect(404)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toContain(
      'This User does not exist - invalid username'
    );
  });
});

describe('user attributes', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test('user blogs', async () => {
    const newBlog = {
      title: 'new blog',
      content: 'new blog',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${user.accessToken}`)
      .send(newBlog);

    const response = await api.get(`/api/user/id/${user.id}`);
    const blogs = response.body.blogs;
    expect(blogs).toHaveLength(1);
    expect(blogs[0].title).toBe('new blog');
    expect(blogs[0].content).toBe('new blog');
  });

  test('user liked blogs', async () => {
    const newBlog = {
      title: 'new blog',
      content: 'new blog',
    };

    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${user.accessToken}`)
      .send(newBlog);

    const blogId = blogResponse.body.id.toString();

    await api
      .put(`/api/blogs/${blogId}/like`)
      .set('Authorization', `bearer ${user.accessToken}`);

    let userInDb = await api.get(`/api/user/id/${user.id}`);
    expect(userInDb.body.likedBlogs).toHaveLength(1);
    expect(userInDb.body.likedBlogs[0].id).toBe(blogId);

    let blogInDb = await api.get(`/api/blogs/${blogId}`);
    expect(blogInDb.body.likedUsers).toHaveLength(1);

    await api
      .put(`/api/blogs/${blogId}/like`)
      .set('Authorization', `bearer ${user.accessToken}`);

    userInDb = await api.get(`/api/user/id/${user.id}`);
    expect(userInDb.body.likedBlogs).toHaveLength(0);

    blogInDb = await api.get(`/api/blogs/${blogId}`);
    expect(blogInDb.body.likedUsers).toHaveLength(0);
  });

  test('user notifications', async () => {
    await Notification.deleteMany({});

    const newBlog = {
      title: 'new blog',
      content: 'new blog',
    };

    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${user.accessToken}`)
      .send(newBlog);

    const blogId = blogResponse.body.id.toString();

    await api
      .put(`/api/blogs/${blogId}/like`)
      .set('Authorization', `bearer ${user.accessToken}`);

    await api
      .put(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `bearer ${user.accessToken}`)
      .send({ comment: 'comment' });

    const response = await api
      .get(`/api/user/id/${user.id}/notification`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const notifications = response.body.notifications;
    expect(notifications[0].message).toBe('test has liked your post!');
    expect(notifications[0].blogId).toBe(blogId);
    expect(notifications[0].userId).toBe(user.id);

    expect(notifications[1].message).toBe('test has commented on your post!');
    expect(notifications[1].blogId).toBe(blogId);
    expect(notifications[1].userId).toBe(user.id);

    await api.delete(
      `/api/user/id/${user.id}/notification/${notifications[0].id}`
    );
    await api.delete(
      `/api/user/id/${user.id}/notification/${notifications[1].id}`
    );

    const userInDbNotifications = await api.get(
      `/api/user/id/${user.id}/notification`
    );
    expect(userInDbNotifications.body.notifications).toHaveLength(0);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
