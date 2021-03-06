import axios from 'axios';

const baseUrl = '/auth';

const authInstance = axios.create({
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://www.bloggers.codes',
});

const login = async (credentials) => {
  const response = await authInstance.post(`${baseUrl}/login`, credentials);
  return response.data;
};

const register = async (credentials) => {
  const response = await authInstance.post(`${baseUrl}/register`, credentials);
  return response.data;
};

const refresh = async () => {
  const response = await authInstance.post(`${baseUrl}/refresh`, {
    withCredentials: true,
  });
  return response.data;
};

const logout = async () => {
  const response = await authInstance.post(`${baseUrl}/logout`, {
    withCredentials: true,
  });
  return response.data;
};

const guestLogin = async () => {
  const response = await authInstance.post(`${baseUrl}/guest`);
  return response.data;
};

const authService = {
  login,
  register,
  refresh,
  logout,
  guestLogin,
};

export default authService;
