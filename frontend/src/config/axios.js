import axios from 'axios';


const axiosInstance = axios.create({
    baseURL:  import.meta.env.VITE_API_URL || "http://localhost:3000",
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