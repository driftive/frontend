import axios from 'axios';
import {API_URL} from "../../configs.ts";
import {useAuthState} from "./hook.ts";

const useAxios = () => {
  const {token} = useAuthState();

  const axiosInstance = axios.create({
    baseURL: API_URL,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Replace `user.token` with the token field
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstance;
};

export default useAxios;
