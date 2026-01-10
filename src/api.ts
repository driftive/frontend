import {QueryClient} from "@tanstack/react-query";
import {API_URL} from "./configs.ts";
import axios from "axios";

export const queryClient = new QueryClient()

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add the token to the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
