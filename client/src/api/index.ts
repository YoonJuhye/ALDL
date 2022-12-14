import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URI,
  withCredentials: true,
});

export default API;
