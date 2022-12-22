import React, {createContext, useEffect, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from '../configs/authConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(false);

  const register = (name, corporation, email, password, permission) => {
    // console.log(children);
    setIsLoading(true);
    axios
      .post(`${BASE_URL}/auth/register`, {
        name,
        corporation,
        email,
        password,
        permission,
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

    // 簡化前端開發流程，不用每次都要與後端溝通登入(暫時性)
    // let userInfo = {
    //   token:
    //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjQzY2FlMGQtMmQ1OS00ZTZmLTg3YTYtYmNjMDRjYWVjNzdiIiwiaWF0IjoxNjcwMjIwMTQ0LCJleHAiOjE2NzAyMjM3NDR9.rNpZlcNt6cHWZsq421y9worQA5HC7yegYkkQFtzXkDI',
    //   user: {
    //     name: '林之謙',
    //     email: 'jechian@gmail.com',
    //     corporation: '臺大土木',
    //     permission: 'admin',
    //   },
    // };
    // console.log(userInfo);
    // setUserInfo(userInfo);
    // AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    // setIsLoading(false);

    axios
      .post(`${BASE_URL}/auth/login`, {
        email,
        password,
      })
      .then(async res => {
        let userInfo = await res.data;  // token與email, name資訊
        console.log(userInfo);
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`login error : ${e}`);
        setIsLoading(false);
      });
  };

  const logout = () => {
    setIsLoading(true);
    AsyncStorage.removeItem('userInfo');
    setUserInfo({});
    setIsLoading(false);
    // axios  // 之後應該要改成這個方式，否則從其他地方只要有token還是可以登入，需再測試
    //   .post(
    //     `${BASE_URL}/auth/logout`,
    //     {},
    //     {
    //       headers: {Authorization: `Bearer ${userInfo.token}`},
    //     },
    //   )
    //   .then(res => {
    //     console.log(res.data);
    //     AsyncStorage.removeItem('userInfo');
    //     setUserInfo({});
    //     setIsLoading(false);
    //   })
    //   .catch(e => {
    //     console.log(`logout error ${e}`);
    //     setIsLoading(false);
    //   });
  };

  const isLoggedIn = async () => {
    try {
      setSplashLoading(true);

      let userInfo = await AsyncStorage.getItem('userInfo');
      userInfo = JSON.parse(userInfo);

      if (userInfo) {
        setUserInfo(userInfo);
      }

      setSplashLoading(false);
    } catch (e) {
      console.log(`is logged in error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  const getUsers = () => {
    setIsLoading(true);

    axios
      .get(`${BASE_URL}/users/all`)
      .then(async res => {
        let users = res.data;
        console.log(users);
        setIsLoading(false);
      })
      .catch(e => {
        console.info(e);
        console.log(`register error : ${e}`);
        setIsLoading(false);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userInfo,
        splashLoading,
        register,
        login,
        logout,
        getUsers,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
