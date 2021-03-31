const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const api = supertest(app);
const config = require('../utils/config');
const Token = require('../models/token');

beforeAll(async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  } catch (err) {
    console.log('error: connecting to MongoDB: ', err.message);
  }
});

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  await Token.deleteMany({});
});

describe('register: creating new users', () => {
  test('successful registration', async () => {
    const newUser = {
      username: 'test',
      password: 'Password1',
      email: 'test@gmail.com',
    };

    const response = await api
      .post('/auth/register')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const { accessToken, username, id } = response.body;
    const userInDb = await helper.usersInDb();
    expect(username).toBe(newUser.username);
    expect(userInDb[0].id).toBe(id.toString());
    expect(accessToken).toBeDefined();
  });

  test('unsuccessful registration - missing username', async () => {
    const newUser = {
      password: 'Password1',
      email: 'test@gmail.com',
    };
    const response = await api.post('/auth/register').send(newUser).expect(400);
    expect(response.body.error).toContain('Missing fields');
  });

  test('unsuccessful registration - missing password', async () => {
    const newUser = {
      username: 'test',
      email: 'test@gmail.com',
    };
    const response = await api.post('/auth/register').send(newUser).expect(400);
    expect(response.body.error).toContain('Missing fields');
  });

  test('unsuccessful registration - missing email', async () => {
    const newUser = {
      username: 'test',
      password: 'Password1',
    };
    const response = await api.post('/auth/register').send(newUser).expect(400);
    expect(response.body.error).toContain('Missing fields');
  });

  test('unsuccessful registration - invalid username', async () => {
    const newUser = {
      username: 'a',
      password: 'Password1',
      email: 'test@gmail.com',
    };
    const response = await api.post('/auth/register').send(newUser).expect(400);
    expect(response.body.error).toContain('invalid username format');
  });

  test('unsuccessful registration - invalid password', async () => {
    const newUser = {
      username: 'test',
      password: 'a',
      email: 'test@gmail.com',
    };
    const response = await api.post('/auth/register').send(newUser).expect(400);
    expect(response.body.error).toContain('invalid password format');
  });

  test('unsuccessful registration - invalid email', async () => {
    const newUser = {
      username: 'test',
      password: 'Password1',
      email: 'a',
    };
    const response = await api.post('/auth/register').send(newUser).expect(400);
    expect(response.body.error).toContain('invalid email address');
  });
});

describe('login: logging in users', () => {
  beforeEach(async () => {
    const newUser = {
      username: 'test',
      password: 'Password1',
      email: 'test@gmail.com',
    };

    const response = await api.post('/auth/register').send(newUser).expect(200);
  });

  test('successful login', async () => {
    const response = await api
      .post('/auth/login')
      .send({ username: 'test', password: 'Password1' })
      .expect(200);

    const { accessToken, username, id } = response.body;
    expect(accessToken).toBeDefined();
    expect(username).toBe('test');
  });

  test('unsuccessful login - missing username', async () => {
    const response = await api
      .post('/auth/login')
      .send({ password: 'Password1' })
      .expect(400);
    expect(response.body.error).toContain('Missing Fields');
  });

  test('unsuccessful login - missing password', async () => {
    const response = await api
      .post('/auth/login')
      .send({ username: 'test' })
      .expect(400);
    expect(response.body.error).toContain('Missing Fields');
  });

  test('unsuccessful login - invalid username', async () => {
    const response = await api
      .post('/auth/login')
      .send({ username: 'wrongusername', password: 'Password1' })
      .expect(400);
    expect(response.body.error).toContain('Invalid username or password');
  });

  test('unsuccessful login - missing password', async () => {
    const response = await api
      .post('/auth/login')
      .send({ username: 'test', password: 'wrongpassword' })
      .expect(400);
    expect(response.body.error).toContain('Invalid username or password');
  });
});

afterAll(() => {
  mongoose.connection.close();
});
