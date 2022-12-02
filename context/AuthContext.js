import React, {createContext, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from '../configs/authConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const register = (name, corporation, email, password) => {
    // console.log(children);
    setIsLoading(true);
    axios
      .post(`${BASE_URL}/auth/register`, {
        name,
        corporation,
        email,
        password,
      })
      .then(async res => {
        let userInfo = await res.data;
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        setIsLoading(false);
        console.log(userInfo);
      })
      .catch(e => {
        console.info(e);
        console.log(`register error : ${e}`);
        setIsLoading(false);
      });
  };

  const login = (email, password) => {
    setIsLoading(true);

    axios
      .post(`${BASE_URL}/auth/login`, {
        email,
        password,
      })
      .then(async res => {
        let userInfo = await res.data;
        console.log(userInfo);
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      })
      .catch(e => {
        console.log(`login error : ${e}`);
        setIsLoading(false);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userInfo,
        register,
        login,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
