const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const Token = require('../models/token');
const api = supertest(app);
require('dotenv').config();

//npm test -- tests/blog_api.test.js

let accessToken;
let userId;

beforeAll(async () => {
  //Connecting to MongoDB (testing database)
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  } catch (err) {
    console.log('error: connecting to MongoDB: ', err.message);
  }

  //clearing users and creating a new user and setting token
  await Token.deleteMany({});
  await User.deleteMany({});
  const user = {
    username: 'test',
    password: 'Password1',
    email: 'test@gmail.com',
  };
  const response = await api.post('/auth/register').send(user).expect(200);
  accessToken = response.body.accessToken;
  expect(accessToken).toBeDefined();
  userId = response.body.id;
});

describe('get: getting blogs', () => {
  let blogId;

  beforeAll(async () => {
    await Blog.deleteMany({});
    const testBlog = { title: 'test blog', content: 'test blog' };
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(testBlog)
      .expect(201);
    blogId = response.body.id;
  });

  test('blogs returned as JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(1);
  });

  test('property of id and not _id', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  });

  test('correct blog is returned', async () => {
    const response = await api.get('/api/blogs');
    const {
      title,
      content,
      likes,
      author,
      comments,
      likedUsers,
    } = response.body[0];
    expect(title).toBe('test blog');
    expect(content).toBe('test blog');
    expect(likes).toBe(0);
    expect(author).toBe('test');
    expect(comments).toHaveLength(0);
    expect(likedUsers).toHaveLength(0);
  });

  test('getting blog from id', async () => {
    const response = await api
      .get(`/api/blogs/${blogId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const {
      title,
      content,
      likes,
      author,
      comments,
      likedUsers,
    } = response.body;
    expect(title).toBe('test blog');
    expect(content).toBe('test blog');
    expect(likes).toBe(0);
    expect(author).toBe('test');
    expect(comments).toHaveLength(0);
    expect(likedUsers).toHaveLength(0);
  });

  test('fails invalid id : status 400', async () => {
    const invalidId = '5a3d5da507badida82b3445';
    await api.get(`/api/blogs/${invalidId}`).expect(400);
  });
});

describe('post: creating blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test('create a new blog post with valid authorization', async () => {
    const newBlog = {
      title: 'new blog',
      content: 'new blog',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(1);

    expect(blogs[0].title).toContain('new blog');
    expect(blogs[0].content).toContain('new blog');
  });

  test('create a new blog post with invalid authorization', async () => {
    const newBlog = {
      title: 'new blog',
      content: 'new blog',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken + 'invalid'}`)
      .send(newBlog)
      .expect(401);

    expect(response.body.error).toContain('invalid token');

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(0);
  });

  test('create a new blog with missing title', async () => {
    const newBlog = {
      content: 'new blog',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(400);
    expect(response.body.error).toContain('Missing Fields');

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(0);
  });
});

describe('delete: deleting blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test('successful delete with valid id and valid token', async () => {
    const newBlog = {
      title: 'deleting this blog',
      content: 'deleting this blog',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogId = response.body.id;

    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `bearer ${accessToken}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(0);

    const contents = blogsAtEnd.map((blog) => blog.title);
    expect(contents).not.toContain(newBlog.title);
  });

  test('unsuccessful delete with invalid id and valid token', async () => {
    const invalidId = '12345abcdef';
    const response = await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `bearer ${accessToken}`)
      .expect(400);
    expect(response.body.error).toContain('malformatted id');

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(0);
  });

  test('unsuccessful delete with invalid token', async () => {
    const newBlog = {
      title: 'deleting this blog',
      content: 'deleting this blog',
    };

    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogId = blogResponse.body.id;

    const response = await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `bearer ${accessToken + 'invalid'}`)
      .expect(401);
    expect(response.body.error).toContain('invalid token');

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(1);
  });
});

describe('put: like blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  let blogId;

  test('successful like and unlike with valid id and valid token', async () => {
    const newBlog = {
      title: 'liking this blog',
      content: 'liking this blog',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    blogId = response.body.id;

    //Liking Blog
    await api
      .put(`/api/blogs/${blogId}/like`)
      .set('Authorization', `bearer ${accessToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    let blogsAtEnd = await helper.blogsInDb();
    const likedBlog = blogsAtEnd[0];
    expect(likedBlog.likes).toBe(1); //likes should be 1
    expect(likedBlog.likedUsers[0].toString()).toBe(userId.toString()); //liked users should contain userId;

    //Unliking Blog
    await api
      .put(`/api/blogs/${blogId}/like`)
      .set('Authorization', `bearer ${accessToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    blogsAtEnd = await helper.blogsInDb();
    const unlikedBlog = blogsAtEnd[0];
    expect(unlikedBlog.likes).toBe(0); //likes should be 0
    expect(unlikedBlog.likedUsers).toHaveLength(0); //liked users should be empty
  });

  test('unsuccessful like with invalid id', async () => {
    const invalidId = '12345abcdefg';
    const response = await api
      .put(`/api/blogs/${invalidId}/like`)
      .set('Authorization', `bearer ${accessToken}`)
      .expect(404);

    expect(response.body.error).toContain('invalid id');
  });

  test('unsuccessful like with invalid token', async () => {
    const response = await api
      .put(`/api/blogs/${blogId}/like`)
      .set('Authorization', `bearer ${accessToken + 'invalid'}`)
      .send({})
      .expect(401);

    expect(response.body.error).toContain('invalid token');
  });
});

describe('put: comment blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test('successful comment with valid id and valid token', async () => {
    const newBlog = {
      title: 'commenting on this blog',
      content: 'commenting on this blog',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogId = response.body.id;

    await api
      .put(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `bearer ${accessToken}`)
      .send({ comment: 'commented on blog' })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const commentedBlog = blogsAtEnd[0];
    expect(commentedBlog.comments[0].comment).toBe('commented on blog');
  });

  test('unsuccessful comment with invalid id', async () => {
    const invalidId = '12345abcdefg';
    const response = await api
      .put(`/api/blogs/${invalidId}/comments`)
      .set('Authorization', `bearer ${accessToken}`)
      .expect(404);

    expect(response.body.error).toContain('invalid id');
  });

  test('unsuccessful comment with invalid token', async () => {
    const newBlog = {
      title: 'commenting on this blog',
      content: 'commenting on this blog',
    };

    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogId = blogResponse.body.id;

    const response = await api
      .put(`/api/blogs/${blogId}/comments`)
      .set('Authorization', `bearer ${accessToken + 'invalid'}`)
      .send({ comment: 'comment' })
      .expect(401);

    expect(response.body.error).toContain('invalid token');
  });
});

describe('put: edit blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  let blogId;

  test('successful edit with valid id and valid token', async () => {
    const newBlog = {
      title: 'editting this blog',
      content: 'editting this blog',
    };

    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${accessToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    blogId = blogResponse.body.id;

    const updatedBlog = {
      title: 'blog is editted',
      content: 'blog is editted',
    };

    await api
      .put(`/api/blogs/${blogId}/edit`)
      .set('Authorization', `bearer ${accessToken}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(1);
    expect(blogsAtEnd[0].content).toBe('blog is editted');
  });

  test('unsuccessful edit with invalid id', async () => {
    const invalidId = '12345abcdefg';
    const response = await api
      .put(`/api/blogs/${invalidId}/edit`)
      .set('Authorization', `bearer ${accessToken}`)
      .send({ content: 'editted' })
      .expect(404);

    expect(response.body.error).toContain('invalid id');
  });

  test('unsuccessful edit with invalid token', async () => {
    const response = await api
      .put(`/api/blogs/${blogId}/edit`)
      .set('Authorization', `bearer ${accessToken + 'invalid'}`)
      .send({ content: 'editted' })
      .expect(401);

    expect(response.body.error).toContain('invalid token');
  });
});

afterAll(() => {
  mongoose.connection.close();
});
