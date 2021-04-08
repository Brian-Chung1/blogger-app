import axios from 'axios';
const baseUrl = '/api/user';

const userInstance = axios.create({
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://www.bloggers.codes',
});

const getAllUsers = async () => {
  const response = await userInstance.get(baseUrl);
  return response.data;
};

const getIdUser = async (id) => {
  const response = await userInstance.get(`${baseUrl}/id/${id}`);
  return response.data;
};

const getUsernameUser = async (username) => {
  const response = await userInstance.get(`${baseUrl}/${username}`);
  return response.data;
};

const getUserNotification = async (id) => {
  const response = await userInstance.get(`${baseUrl}/id/${id}/notification`);
  return response.data.notifications;
};

const deleteUserNotification = async (userId, notificationId) => {
  const response = await userInstance.delete(
    `${baseUrl}/id/${userId}/notification/${notificationId}`
  );
  return response.data;
};

const userService = {
  getAllUsers,
  getIdUser,
  getUsernameUser,
  getUserNotification,
  deleteUserNotification,
};

export default userService;
