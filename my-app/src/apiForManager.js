import axios from 'axios';
 
const api = axios.create({
  baseURL: 'http://54.145.172.167:5000/api',
  withCredentials: true,
});
 
// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    config.headers.Authorization = `Bearer ${token}`;
   
 
    return config;
  },
  (error) => Promise.reject(error)
);
 
export default api;
