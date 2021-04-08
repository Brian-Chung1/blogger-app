import axios from 'axios';
import { getToken } from '../utils/index';

const baseUrl = '/api/blogs';

const blogInstance = axios.create({
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://www.bloggers.codes',
});

blogInstance.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshTokenInterceptor = () => {
  const interceptor = blogInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status !== 401) {
        return Promise.reject(error);
      }

      blogInstance.interceptors.response.eject(interceptor);

      return blogInstance
        .post('/auth/refresh', { withCredentials: true })
        .then((response) => {
          const newAccessToken = response.data.accessToken;
          const currentUser = JSON.parse(
            window.localStorage.getItem('blogAppUser')
          );
          const updatedUser = { ...currentUser, accessToken: newAccessToken };
          window.localStorage.setItem(
            'blogAppUser',
            JSON.stringify(updatedUser)
          );
          error.response.config.headers['Authorization'] =
            'bearer ' + newAccessToken;
          return blogInstance(error.response.config);
        })
        .catch((error) => {
          window.localStorage.removeItem('blogAppUser');
          window.location.href = '/login';
          return Promise.reject(error);
        })
        .finally(refreshTokenInterceptor);
    }
  );
};

refreshTokenInterceptor();

const getAllBlogs = async () => {
  const response = await blogInstance.get(baseUrl);
  return response.data;
};

const getIdBlog = async (id) => {
  const response = await blogInstance.get(`${baseUrl}/${id}`);
  return response.data;
};

const postBlog = async (blog) => {
  const response = await blogInstance.post(baseUrl, blog);
  return response.data;
};

const deleteBlog = async (id) => {
  const response = await blogInstance.delete(`${baseUrl}/${id}`);
  return response.data;
};

const likeBlog = async (id) => {
  const response = await blogInstance.put(`${baseUrl}/${id}/like`, {});
  return response.data;
};

const commentBlog = async (id, comment) => {
  const response = await blogInstance.put(`${baseUrl}/${id}/comments`, comment);
  return response.data;
};

const editBlog = async (id, content) => {
  const response = await blogInstance.put(`${baseUrl}/${id}/edit`, content);
  return response.data;
};

const blogService = {
  getAllBlogs,
  getIdBlog,
  postBlog,
  deleteBlog,
  likeBlog,
  commentBlog,
  editBlog,
};

export default blogService;
