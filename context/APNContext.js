import React, {createContext, useContext} from "react";
import { connect } from "react-redux";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../configs/authConfig";


export const APNContext = createContext({
  configure: () => {
    PushNotification.configure({
      onRegister: async function (tokenData) {
        const userInfo = await AsyncStorage.getItem("userInfo");
        console.log('onRegisterDevice', userInfo);
        const { token } = tokenData;
        console.log(token);
        let user = userInfo;
        console.log("user: ", user);
        let userJson = JSON.parse(user);
        console.log(userJson.user.uuid);

        // Send "device token" to server-side
        axios({
          url: `${BASE_URL}/auth/bind`,
          method: 'post',
          body: {
            deviceToken: token,
            userId: userJson.user.uuid,
          },
        })
          .then((res) => {
            console.log(res.data);
          })
          .catch((e) => {
            console.error(e);
          });
      },
      onNotification: function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  },
});

export const APNProvider = ({children}) => {
  // Do not work here.
  // Not familliar with Context.
  const configure = () => {
    PushNotification.configure({
      onRegister: function (tokenData) {
        console.log('onRegister');
        const { token } = tokenData;
        console.log(token);
      },
      onNotification: function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  return (
    <APNContext.Provider
      value={{
        configure: configure,
      }}
    >
      {children}
    </APNContext.Provider>
  );
};
