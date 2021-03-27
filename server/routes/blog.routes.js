const blogsRouter = require('express').Router();
const blogs = require('../controllers/blogs');

blogsRouter.get('/', blogs.getAll);
blogsRouter.get('/:id', blogs.getIdBlog);
blogsRouter.post('/', blogs.postBlog);
blogsRouter.delete('/:id', blogs.deleteBlog);
blogsRouter.put('/:id/like', blogs.likeBlog);
blogsRouter.put('/:id/comments', blogs.commentBlog);
blogsRouter.put('/:id/edit', blogs.editBlog);

module.exports = blogsRouter;
