import axios from 'axios';

const API = '/api/tasks';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
export const getTasks = () => axios.get(API, getHeaders());
export const createTask = (task) => axios.post(API, task, getHeaders());
export const updateTask = (id, task) => axios.put(`${API}/${id}`, task, getHeaders());
export const deleteTask = (id) => axios.delete(`${API}/${id}`, getHeaders());
