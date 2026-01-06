import axios from 'axios';


const axiosInstance = axios.create({
    baseURL:  "http://localhost:3000",
    withCredentials: true,
    headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }
})



// ✅ Always attach the latest token before each request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default axiosInstance;   