import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);

  if (response.data) {
    // Remainder : localStorage only stores strings, so we must stringify the JSON object
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// We will add register, logout, etc. functions here
const authService = {
  login,
  logout, // Adding logout to the exported object
};

export default authService;



