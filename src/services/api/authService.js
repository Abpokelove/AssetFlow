import axiosInstance from './axiosInstance';

export const loginUser = (data) =>
  axiosInstance.post('/auth/login', data);

export const registerUser = (data) =>
  axiosInstance.post('/auth/register', data);

export const getCurrentUser = () =>
  axiosInstance.get('/auth/me');
