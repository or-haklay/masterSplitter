import httpServices from './httpServices'
import { jwtDecode } from "jwt-decode"
import { useEffect } from "react";

const TOKEN_KEY = "token";
refreshToken();

async function getUserData(userId) {
    const response = await httpServices.get(`/users/${userId || "me"}`);
    return response.data;
  }

async function login(user) {
    const response = await httpServices.post('/users/login/', user)
    setToken(response.data.token)
    console.log(response);
    
    return response.data.token
}

async function register(user) {
    const response = await httpServices.post('/users/register/', user)
    setToken(response.data.token)
    return response.data
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
    refreshToken();
  }

  function logOut() {
    setToken(null);
  }
  
  function refreshToken() {
    httpServices.setDefaultCommonHeaders("x-auth-token", getJWT());
  }
  
  function getJWT() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      const token = getJWT();
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

export default {
    getUserData,
    login,
    register,
    setToken,
    logOut,
    refreshToken,
    getJWT,
    getUser,
}
