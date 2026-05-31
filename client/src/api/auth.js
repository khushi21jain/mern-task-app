import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

export const login = (data) => axios.post(`${API}/login`, data);
export const register = (data) => axios.post(`${API}/register`, data);